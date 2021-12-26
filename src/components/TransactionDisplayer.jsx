import React from 'react';
import styles from './TransactionDisplayer.module.scss';
import { DateUtil } from '../utils.jsx';
import * as R from 'ramda';
import Tags from '../domain/Tags.js';

export const TransactionDisplayer = (props) => {
  const { transaction } = props;
  const formattedDate = DateUtil.formatFullReadable(transaction.date);
  const tags = R.pathOr([], ['tags'], transaction);
  return (
    <div className={styles.transactionDisplayer}>
      <div>
        <span>Pk: </span>
        <span>{transaction.pk}</span>
      </div>
      <div>
        <span>Description: </span>
        <span>{transaction.description}</span>
      </div>
      <div>
        <span>Reference: </span>
        <span>{transaction.reference}</span>
      </div>
      <div>
        <span>Date: </span>
        <span>{formattedDate}</span>        
      </div>
      <div>
        <span>Tags: </span>
        {R.addIndex(R.map)(
          (tag, index) => <TagDisplayer key={index} tag={tag} />
        )(tags)}
      </div>
      <div>
        <span>Movements: </span>
        {R.addIndex(R.map)(
          (movement, index) => <MovementDisplayer key={index} movement={movement} />
        )(transaction.movements)}
    </div>
    </div>
  );
};

export const MovementDisplayer = (props) => {
  const { movement } = props;
  return (
    <div className={styles.movementDisplayer}>
      <div>
        <span>Account: </span>
        <span>{movement.account}</span>
      </div>
      <div>
        <span>Comment: </span>
        <span>{movement.comment}</span>
      </div>
      <div>
        <span>Money: </span>
        <span>{JSON.stringify(movement.money)}</span>
      </div>
    </div>
  );
};

export const TagDisplayer = (props) => {
  const { tag } = props;
  return (
    <div className={styles.tagsDisplayer}>
      {Tags.toStringRepr([tag])}
    </div>
  );
};

export default TransactionDisplayer;
