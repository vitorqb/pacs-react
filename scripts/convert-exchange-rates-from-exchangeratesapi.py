#!/bin/env python3
"""
Translation layer for exchange rates between
https://api.exchangeratesapi.io/history and pacs

Transforms something like this:
curl 'https://api.exchangeratesapi.io/history?start_at=2019-01-01&end_at=2019-02-28&symbols=BRL,EUR&base=USD' | jq '.'
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2286    0  2286    0     0   4772      0 --:--:-- --:--:-- --:--:--  4762
{
  "base": "USD",
  "rates": {
    "2019-02-15": {
      "EUR": 0.8880994671,
      "BRL": 3.7168738899
    },
    "2019-02-27": {
      "EUR": 0.8782715616,
      "BRL": 3.7282627789
    },
    },
[...]
    "2019-01-16": {
      "EUR": 0.8780402142,
      "BRL": 3.7115637896
    },
    "2019-01-30": {
      "EUR": 0.8749671887,
      "BRL": 3.7091609065
    }
  },
  "end_at": "2019-02-28",
  "start_at": "2019-01-01"
}

Into this:
[
    {
        "currency": "EUR",
        "prices": [
            {
                "date": "2019-02-15",
                "price": 0.8880994671,
            },
            {
                "date": "2019-02-16",
                "price": 0.8782715616,
            },
            [...]
        ]
    },
    {
        "currency": "BRL",
        "prices": [
            {
                "date": "2019-02-15",
                "price": 3.7168738899,
            },
            {
                "date": "2019-02-16",
                "price": 3.7282627789,
            },
            [...]
        ]
    },
]
"""
import json
import sys
from datetime import datetime, timedelta


date_format = "%Y-%m-%d"


def date_before(date):
    date = datetime.strptime(date, date_format)
    date_before = date - timedelta(days=1)
    return date_before.strftime(date_format)


def date_after(date):
    date = datetime.strptime(date, date_format)
    date_after = date + timedelta(days=1)
    return date_after.strftime(date_format)


def main():
    payload = json.load(sys.stdin)

    rates = payload['rates']
    currencies = list(rates.values())[0].keys()

    # type: Dict[(str, str): float]
    # {(EUR, 2019-01-01): 9.99989182}
    data = {}
    for currency in currencies:
        for date, rate in rates.items():
            data[(currency, date)] = rate[currency]

    # Fill missing dates
    mindate = min(k[1] for k in data.keys())
    maxdate = max(k[1] for k in data.keys())
    for cur in currencies:
        i_date = mindate
        while i_date < maxdate:
            if (cur, i_date) not in data:
                data[cur, i_date] = data[cur, date_before(i_date)]
            i_date = date_after(i_date)

    dates = set(k[1] for k in data.keys())

    out = []
    for currency in currencies:
        prices = []
        for date in dates:
            # Revert price (because we use it this way)
            price = 1 / data[(currency, date)]
            prices.append({"date": date, "price": price})
        out.append({"currency": currency, "prices": prices})

    print(json.dumps(out))


if __name__ == "__main__":
    main()
