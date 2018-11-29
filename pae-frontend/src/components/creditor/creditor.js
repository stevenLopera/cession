import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {
  Button,
  Container,
  Modal,
  Grid,
  Header,
  Icon,
  Image,
  List,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Card,
  GridColumn,
  GridRow,
  Form,
  Message
} from 'semantic-ui-react'  

class Creditor extends Component {
  render() {
    return <DesktopContainer/>;
  }
}

class DesktopContainer extends Component {
  state = {
    isRequestsShown: true
  }

  onMenuOptionChange = () => {
    this.setState({isRequestsShown : !this.state.isRequestsShown})
  }

  render() {
    const { children } = this.props

    return (
      <Responsive minWidth={Responsive.onlyTablet.minWidth}>
        <Segment
          style={{ minHeight: 600, padding: '1em 0em' }}>
          <Grid>
            <GridRow>
              <GridColumn width={3}>
                <Segment inverted style={{
                  minHeight : 600
                }}>
                  <SideMenuVertical changeMenuOption = {this.onMenuOptionChange}/>
                </Segment>
              </GridColumn>
              <GridColumn width = {13}>
                <Container >
                  {this.state.isRequestsShown ? <RequestsComponent /> : null} 
                </Container>
              </GridColumn>
            </GridRow>
          </Grid>
        </Segment>
        {children}
      </Responsive>
    )
  }
}

DesktopContainer.propTypes = {
  children: PropTypes.node,
}

class SideMenuVertical extends Component {
  state = { activeItem: 'requests' }

  handleItemClick = (e, { name }) => {
    if (this.state.activeItem !== name) {
      this.setState({ activeItem: name })
      this.props.changeMenuOption();
    }
  }

  render() {
    const { activeItem } = this.state

    return (
      <Menu pointing secondary vertical inverted>
        <Menu.Item
          name='requests'
          active={  activeItem === 'requests'}
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='payments'
          active={activeItem === 'payments'}
          onClick={this.handleItemClick}
        />
      </Menu>
    )
  }
}


class RequestsComponent extends Component {
  constructor(props) {
    super(props);
    //this.handleChange = this.handleChange.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.rejectRequest = this.rejectRequest.bind(this);
    this.state = {
      selectedRequest: '',
      showModal: false,
      showValidationMessage: false,
      isRequestValidated: false
    }
  }

  /*handleChange(event) {
    this.setState({invoiceKey: event.target.value});
  }*/

  getRequests() {
    // TODO: get requests from SM???
    return [
      {
        assigneeName: 'Pepe',
        invoiceHash: '27381273194',
      },
      {
        assigneeName: 'Jerry',
        invoiceHash: 'sg172g8471g72dg871238s126sf'
      }
    ]
  }

  handleItemClick = (event) => {
    // Only way found to detect the element clicked
    const activeItem = event.target.parentNode.parentNode.id
    
    this.setState({
      selectedRequest: activeItem,
      showModal: true
    })
  }

  showModal() {
    const activeItem = this.getRequests().find((item) => item.assigneeName === this.state.selectedRequest)

    if(activeItem) {
      return (
        <Modal
          open = {this.state.showModal}
          onClose = {() => this.setState({showModal: false})}
        >
          <Modal.Header>{activeItem.assigneeName}</Modal.Header>
          <Modal.Content>
            <Button color = 'green' onClick = {() => this.validateRequest(activeItem)}>
              <Icon name = 'react'></Icon>
                Validate invoice
            </Button>
            <Button color = 'red' onClick = {() => this.rejectRequest(activeItem)}>
              <Icon name = 'close'></Icon>
                Reject
            </Button>
          </Modal.Content>
        </Modal>
      )
    }
  }

  closeModal() {
    this.setState({showModal: false})
  }


  validateRequest(request) {
    this.closeModal()
    this.setState({showValidationMessage: true,
                    isRequestValidated: true})
    //TODO: accept request HOW??
    
    //TODO VALIDATE
  }
 
  rejectRequest(request) {
    this.closeModal()
    this.setState({showValidationMessage: true,
                    isRequestValidated: false})
    //TODO: reject request HOW??
  }

  showValidationMessage() {
    return (<ValidateRequestComponent isValidate = {this.state.isRequestValidated}></ValidateRequestComponent>)
  }

  render() {
    const listItems = this.getRequests().map((result) => 
      <List.Item key= {result.assigneeName}>
        <div id={result.assigneeName} onClick = {this.handleItemClick}>
          <Card
            as = 'a'
            header={result.assigneeName}
            id = {result.assigneeName}
          />  
        </div>
      </List.Item>
    )
    return(
      <div style = {{
        display: 'inline-block',
        textAlign: "left"
      }}>
        <List items = {listItems} />
        {this.showModal()}
        {console.log(this.state)}
        {this.state.showValidationMessage ? <ValidateRequestComponent isValidate = {this.state.isRequestValidated}></ValidateRequestComponent> : null}
      </div>
    )
  }
}

class ValidateRequestComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
                isValidate: props.isValidate
                };
    console.log('validate constructor');
    this.updateState = this.updateState.bind(this)
    //TODO: Confirm the fields needed
  }
  
  updateState() {
    this.setState({isValidate: this.props.isValidate})
  }

  render() {
    
    const MessageValidatedRequest = () => (
      <Message
        icon='check'
        header='Resquest validated'
        content='The request has been validated and it is safe to proceed with the payment'
      />
    )

    const MessageNotValidatedRequest = () => (
      <Message
        icon='close'
        header='Request validation failed'
        content='The request has not been validated.'
      />
    )

    return(
      <Container>
        {this.state.isValidate ? (<MessageValidatedRequest />) : (<MessageNotValidatedRequest />)}
      </Container>)
  }

}


export default Creditor;
