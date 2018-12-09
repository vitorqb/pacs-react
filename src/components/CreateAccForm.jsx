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
    event.preventDefault()
    this.props.createAcc(this.state)
  }

  render() {
    const { name, accType, parent } = this.state;
    // !!!! -> Abstract title maker?
    // !!!! -> Function to create input
    return (
      <div className="accFormDiv">
        <span className="title">{this.props.title}</span>
        <form onSubmit={this.handleSubmit}>
          <div className="inputDiv">
            Name: 
            <input
              type="text"
              name="name"
              value={name}
              onChange={this.handleNameUpdate} />
          </div>
          <div className="inputDiv">
            accType:
            <input
              type="text"
              name="accType"
              value={accType}
              onChange={this.handleAccTypeUpdate} />
          </div>
          <div className="inputDiv">
            Parent: 
            <input
              type="number"
              name="parent"
              value={parent}
              onChange={this.handleParentUpdate} />
          </div>
          <input type="submit" value="Submit" />
        </form>
      </div>
    )
  }
}

