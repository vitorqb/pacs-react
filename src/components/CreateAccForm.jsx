import React, { Component } from 'react'
import { createTitle, createInput } from '../utils';


/** A react component that represents a form to create an account. */
export default class CreateAccForm extends Component {

  /**
    * Creates the component
    * @param {Object} props The props.
    * @param {string} props.title A title for the form.
    * @param {Function} props.createAcc - A function that accepts this.state
    *    and performs the creation of the Account object.
    */
  constructor(props) {
    super(props);
    this.state = { name: "", accType: "", parent: "" }
  }

  handleNameUpdate = (event) => {
    this.setState({...this.state, name: event.target.value})
  }

  handleAccTypeUpdate = (event) => {
    this.setState({...this.state, accType: event.target.value})
  }

  handleParentUpdate = (event) => {
    this.setState({...this.state, parent: event.target.value})
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.props.createAcc(this.state)
  }

  render() {
    const inputs = this.renderInputs();
    const title = createTitle(this.props.title);
    return (
      <div className="form-div">
        {title}
        <form onSubmit={this.handleSubmit}>
          {inputs}
          <input type="submit" value="Submit" />
        </form>
      </div>
    )
  }

  /**
    * Renders the `input` tags for the form.
    * @returns - an array of Input tags.
    */
  renderInputs() {
    const { name, accType, parent } = this.state;
    const inputsData = [
      {
        type: "text",
        name: "name",
        onChange: this.handleNameUpdate,
        value: name
      },
      {
        type: "text",
        name: "accType",
        onChange: this.handleAccTypeUpdate,
        value: accType
      },
      {
        type: "number",
        name: "parent",
        onChange: this.handleParentUpdate,
        value: parent
      }
    ]
    return inputsData.map(createInput)
  }
}

