import React, { Component } from 'react'


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
    this.props.createAcc(this.state)
  }

  render() {
    const { name, accType, parent } = this.state;
    // !!!! -> Abstract title maker?
    // !!!! -> Function to create input
    return (
      <div className="accFormDiv">
        <span className="title">{this.props.title}</span>
        <form>
          <input
            type="text"
            name="name"
            value={name}
            onChange={this.handleNameUpdate} />
          <input
            type="text"
            name="accType"
            value={accType}
            onChange={this.handleAccTypeUpdate} />
          <input
            type="number"
            name="parent"
            value={parent}
            onChange={this.handleParentUpdate} />
          <input type="submit" onClick={this.handleSubmit}/>
        </form>
      </div>
    )
  }
}

