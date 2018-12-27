import React, { Component } from 'react';

/**
 * A component that prompts the user to select an Account.
 */
export default class AccountPicker extends Component {

  /**
   * @param {object} props
   * @param {fn(number): Promise<Account>} getAccount - A function that maps a pk
   *   to an Account.
   * @param {fn(Account): ?} onPicked - A function called when an account is chosen.
   */
  constructor(props) {
    super(props)
    this.state = {pk: null};
  }

  handlePkChange = (event) => {
    this.setState({pk: Number(event.target.value)});
  }

  handleSubmit = (event) => {
    event.preventDefault()
    return this
      .props
      .getAccount(this.state.pk)
      .then(this.props.onPicked);
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <span>Pk:</span>
          <input name="pk" type="number" onChange={this.handlePkChange} />
          <input type="submit" />
        </form>
      </div>
    )
  }
  
}
