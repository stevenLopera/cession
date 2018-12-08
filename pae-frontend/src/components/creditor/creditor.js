import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {
  Button,
  Container,
  Modal,
  Grid,
  Icon,
  List,
  Menu,
  Responsive,
  Segment,
  Card,
  GridColumn,
  GridRow,
  Form,
  Message,
  Header
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
      <Responsive>
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
                  {this.state.isRequestsShown ? <RequestsComponent /> : <PaymentsComponent />} 
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
          id = 'payments'
          active={activeItem === 'payments'}
          onClick={this.handleItemClick}
        />
      </Menu>
    )
  }
}



// REQUESTS


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
      isRequestValidated: false,
      hasRequests: false,
      requests: []
    } 
    // this.getRequests().bind(this)
  }

  componentDidMount() {
    this.getRequests()
  }

  getRequests() {
    // TODO: get requests from SM???
    this.setState({
      hasRequests: true, 
      requests: [
        {
          assigneeName: 'Pepe',
          invoiceHash: '27381273194',
        },
        {
          assigneeName: 'Jerry',
          invoiceHash: 'sg172g8471g72dg871238s126sf'
        }
      ]
    })
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
    const activeItem = this.state.requests.find((item) => item.assigneeName === this.state.selectedRequest)

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
    
    //TODO send public key to firebase
    // callback:
    this.onRequestValidated()
  }

  // public key sent to firebase callback
  onRequestValidated() {
      // Todo smart contract call: containsPublicKeyBank(hash(public_key))
      // if true:
      // 
      // this.setState({showValidationMessage: true,
      //                isRequestValidated: true})

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


      const listItems = this.state.requests.map((result) => 
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

      const EmptyRequests = () => (
        <Segment placeholder style={{minHeight: 600}}>
              <Header icon>
                <Icon name='file outline' />
                There are not any requests at the moment. Try refreshing the page or come back later.
              </Header>
              <Button onClick = {() => window.location.reload()}>
                <Icon name = 'redo'></Icon>
                Reload
              </Button>
          </Segment>
      )

      return(
        
        <div>
          {this.state.hasRequests ? 
          <div style = {{
            display: 'inline-block',
            textAlign: "left"
          }}>
            <List items = {listItems} />
            {this.showModal()}
            <div style = {{textAlign: ''}}>
              {this.state.showValidationMessage ? <ValidateRequestComponent isValidate = {this.state.isRequestValidated}></ValidateRequestComponent> : null}
            </div>
          </div>
          :
          <EmptyRequests/>}
        </div>
      )
  }
}

class ValidateRequestComponent extends Component {
  state = {
    isValidate: this.props.isValidate,
    isOfferSent: false,
    offerComission: '',
    accountNumber: ''
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ isValidate: nextProps.isValidate });  
  }

  sendOffer() {
    // TODO send offer
    if (this.state.offerComission && this.state.accountNumber) {
      // TODO send offer to their assignee via firebase
      // check Esquema final
      // offer:
      // [accountNumber, hash(invoiceData, requestDetails)]
      // sign that shit above

      // callback:
      this.setState({
        isOfferSent: true
      })
    }
    console.log(this.state)
  }

  handleChange(event) {
    console.log(event.target)
    this.setState({[event.target.name]: event.target.value})
  }

  goToPayments() {
    //todo redirect to payments using router??
    const payments = document.getElementById('payments')
    payments.click()
  }

  render() {
    
    const MessageValidatedRequest = () => (
      <div style = {{marginTop: 30}}>
        <Message
          icon='check'
          header='Request validated'
          content='The request has been validated and it is safe to proceed with the payment'
          color = 'green'
          style = {{textAlign: 'left'}}
        />

        {/* THIS IS HARDCODED, TO BE CHANGED WITH REAL INVOICE DATA */}
        <div style={{textAlign:'center'}}>
          <div style = {{textAlign: 'left', display: 'inline-block'}}>
            <Segment color = 'black' padded style = {{maxHeight: 400, maxWidth: 250}}>
              <List>
                <List.Item style = {{fontSize: 20}}>
                  <List.Header>Invoice details</List.Header>
                </List.Item>
                <List.Item>
                  <List.Icon name='euro' />
                  <List.Content>Amount: 65000€</List.Content>
                </List.Item>
                <List.Item>
                  <List.Icon name='calendar alternate outline' />
                  <List.Content>
                    Emission date: 22-10-2018
                  </List.Content>
                </List.Item>
                <List.Item>
                  <List.Icon name='calendar times outline' />
                  <List.Content>
                    Expiration date: 22-10-2019
                  </List.Content>
                </List.Item>
              </List>
            </Segment>
          </div>
        </div>

        <Form>
          <Form.Input type='number' name = 'offerComission' value = {this.state.offerComission} label='Comission(%)' placeholder='7%' onChange = {this.handleChange.bind(this)}/>
          <Form.Input type='text' name = 'accountNumber' value = {this.state.accountNumber} label='Account number'
                      placeholder='3704 0044 0532 0130 00' onChange = {this.handleChange.bind(this)}/>          
          <Button disabled = {this.state.isOfferSent} type='submit' color = 'instagram' className = 'big' onClick = {this.sendOffer.bind(this)}>
              <Icon name = 'send' />
              Send offer
          </Button>

          { this.state.isOfferSent ? <OfferSuccessSent /> : null }
        </Form>
      </div>
    )

    const OfferSuccessSent = () => (<Message hidden = {!this.state.isOfferSent} color='green'>
    <Message.Header>Offer completed</Message.Header> 
    <Message.Content>Your offer was successfully sent to the corresponding assignee,
                      if he accepts it you can proceed with the payment in the Payments section <br></br>
      <div style={{textAlign: 'left'}}>
        <Button style = {{marginTop: 10}} color = 'green' onClick = {this.goToPayments.bind(this)}>Go</Button>
      </div>
    </Message.Content>            
    </Message>)

    const MessageNotValidatedRequest = () => (
      <Message
        icon='cancel'
        header='Request validation failed'
        content='The request has not been validated.'
        color = 'red'
      />
    )

    return(
      <div style={{maxWidth: 800, minWidth:800}} >
        {this.state.isValidate ? (<MessageValidatedRequest />) : (<MessageNotValidatedRequest />)}
      </div>
    )
  }

}


// PAYMENTS

class PaymentsComponent extends Component {

  state = {
    hasPayments: false,
    payments: []
  }

  componentDidMount() {
    this.getPayments()
  }

  getPayments() {
    // TODO: get payments from SM???
    this.setState({
      hasPayments: true, 
      payments: [
        {
          assigneeName: 'Pepe',
          invoiceHash: '27381273194',
        },
        {
          assigneeName: 'Jerry',
          invoiceHash: 'sg172g8471g72dg871238s126sf'
        }
      ]
    })
  }

  handleItemClick = (event) => {
    // Only way found to detect the element clicked
    const activeItem = event.target.parentNode.parentNode.id
    
    this.setState({
      selectedPayment: activeItem,
      showModal: true
    })
  }

  paySelectedInvoice() {
    // todo set isPayed attribute to true firebase
  }

  showModal() {
    const activeItem = this.state.payments.find((item) => item.assigneeName === this.state.selectedPayment)

    if(activeItem) {
      return (
        <Modal
          open = {this.state.showModal}
          onClose = {() => this.setState({showModal: false})}
        >
          <Modal.Header>{activeItem.assigneeName}</Modal.Header>
          <Modal.Content>
            <Button color = 'green' onClick = {() => this.paySelectedInvoice()}>
              <Icon name = 'payment'></Icon>
                Pay
            </Button>
          </Modal.Content>
        </Modal>
      )
    }
  }

  render() {
   
    const listItems = this.state.payments.map((result) => 
    <List.Item key= {result.assigneeName}>
      <div id={result.assigneeName} onClick = {this.handleItemClick}>
        <Card
          as = 'a'
          header={result.assigneeName}
          id = {result.assigneeName}
        />  
      </div>
    </List.Item>)

    const PaymentsList = () => (
      <div>
        <List items = {listItems} />
        {this.showModal()}
      </div>
    )

    const EmptyPayments = () => (<div>
      <Segment placeholder style={{minHeight: 600}}>
        <Header icon>
          <Icon name='ethereum' />
          There are not any payments to be done at the moment. Try refreshing the page or come back later.
        </Header>
        <Button onClick = {() => window.location.reload()}>
          <Icon name = 'redo'></Icon>
          Reload
        </Button>
      </Segment>
    </div>)


    return(
      <div>
        {this.state.hasPayments ? <PaymentsList /> : <EmptyPayments/>}
      </div>
    )
  }
}

export default Creditor;
