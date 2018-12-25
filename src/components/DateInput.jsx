import React, { Component } from 'react';
import moment from 'moment';

/**
 * Input for a date.
 */
export default class DateInput extends Component {

  /**
   * @param {object} props
   * @param {moment} props.value
   * @param {fn(moment): ?} onChange - A callback. Receives either a `moment` date
   *   or `null` if an invalid date was entered.
   */
  constructor(props) {
    super(props)
    this.state = {rawValue: props.value ? props.value.format("YYYY-MM-DD") : ""}
  }

  /**
   * When we receive props, if it is not null or undefined, update rawValue.
   * If we receive null, either we just emitted an invalid date (=null) or
   */
  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    if (value) {
      this.setState({rawValue: value.format("YYYY-MM-DD")});
    }
  }

  /**
   * Handles an text input from the user.
   */
  handleChange = e => {
    const rawValue = e.target.value
    this.setState({rawValue});
    const date = moment.utc(rawValue, "YYYY-MM-DD", true);
    if (date.isValid()) {
      this.props.onChange(date);
    } else {
      this.props.onChange(null);
    }
  }

  render() {
    return (
      <input
        name="date"
        onChange={this.handleChange}
        value={this.state.rawValue} />
    )
  }

}
