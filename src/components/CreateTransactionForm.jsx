import React, { Component } from 'react';
import { createTitle, createInput } from '../utils';

/**
 * A component that wraps a form to create a Transaction.
 */
export default class CreateTransactionForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      description: "",
      date: ""
    }
  }

  handleDescriptionUpdate = (e) => {
    this.setState({...this.state, description: e.target.value})
  }

  handleDateUpdate = (e) => {
    this.setState({...this.state, date: e.target.value})
  }

  render() {
    const { title="" } = this.props;
    const titleSpan = createTitle(title);
    const inputs = this.renderInputs();

    return <form>{titleSpan}{inputs}</form>
  }

  /**
   * Renders the input tags for the form.
   */
  renderInputs() {
    const { description, date } = this.state;
    const inputsData = [
      {
        type: "text",
        name: "description",
        onChange: this.handleDescriptionUpdate,
        value: description
      },
      {
        type: "text",
        name: "date",
        onChange: this.handleDateUpdate,
        value: date
      }
    ]
    return inputsData.map(createInput)
  }
}
