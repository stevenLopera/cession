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
  Header,
  Dimmer,
  Loader
} from 'semantic-ui-react'  
import { getInvoicesList, getBankPublicKey, createAcceptedInvoice, getInvoiceByID, deleteInvoiceByInvoiceID } from '../../managers/firebaseManager';
import { generateInvoiceHash, generateIdAndNifHash, generateRKey } from '../../utils/crypto_hash_sign';
import { isNullOrUndefined } from 'util';

class Creditor extends Component {
  render() {
    return <DesktopContainer/>;
  }
}

class DesktopContainer extends Component {
  state = {
    isRequestsShown: true,
    activeChildren: 'requests'
  }

  onMenuOptionChange = (active) => {
    this.setState({isRequestsShown : 
      !this.state.isRequestsShown,
      activeChildren: active
    })
  }

  currentChildren() {
    switch (this.state.activeChildren) {
      case 'requests':
        return (<RequestsComponent/>)
      case 'payments':
        return (<PaymentsComponent></PaymentsComponent>)
      case 'signments':
        return (<SignmentsComponent></SignmentsComponent>)
      default:
        return null
    }
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
                  {this.currentChildren()} 
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

  handleItemClick = (e, { id }) => {
    if (this.state.activeItem !== id) {
      this.setState({ activeItem: id })
      this.props.changeMenuOption(id  );
    }
  }

  render() {
    const { activeItem } = this.state

    return (
      <div>
        <Header as='h2' style = {{marginTop: 25}} inverted>
          <Icon name='user circle' />
          <Header.Content>
            Creditor
          </Header.Content>
        </Header>
        <Menu pointing secondary vertical inverted>
          <Menu.Item
            name='requests'
            id = 'requests'
            active={  activeItem === 'requests'}
            onClick={this.handleItemClick}
          />
          
          <Menu.Item
            name='Signatures'
            id = 'signments'
            active={activeItem === 'signments'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name='payments'
            id = 'payments'
            active={activeItem === 'payments'}
            onClick={this.handleItemClick}
          />
        </Menu>
      </div>
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
      selectedRequest: {},
      showModal: false,
      showValidationMessage: false,
      isRequestValidated: false,
      hasRequests: false,
      isLoading: true,
      requests: [],
      hasSelectedRequest: false,
      showAcceptedMessage: false
    } 
    this.getRequests = this.getRequests.bind(this)
  }

  componentDidMount() {
    this.getRequests()
  }

  getRequests() {
    getInvoicesList('creditor').then((res) => {
      this.setState({
        requests: res,
        isLoading: false,
        hasRequests: res.length > 0
      })
      console.log('promise returned');
    })
  }

  handleItemClick = (event) => {
    // Only way found to detect the element clicked
    const activeItemName = event.target.parentNode.parentNode.id

    const activeItem = this.state.requests.find((item) => (item.data.invoiceID === activeItemName))
    
    this.setState({
      selectedRequest: activeItem,
      showModal: true,
      hasSelectedRequest: true
    })
  }

  getInvoiceDetailsView = () => (
    
    <div style={{textAlign:'center'}}>
        <div style = {{textAlign: 'left', display: 'inline-block'}}>
          <Segment color = 'black' padded style = {{maxHeight: 400, maxWidth: 250}}>
            <List>
              <List.Item style = {{fontSize: 20}}>
                <List.Header>{this.state.selectedRequest.data.invoiceID}</List.Header>
              </List.Item>
              <List.Item>
                <List.Icon name='euro' />
                <List.Content>Amount: {this.state.selectedRequest.data.amount}€</List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='calendar alternate outline' />
                <List.Content>
                  Emission date: {this.state.selectedRequest.data.emissionDate}
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='calendar times outline' />
                <List.Content>
                  Expiration date: {this.state.selectedRequest.data.expirationDate}
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='id card outline' />
                <List.Content>
                  NIF: {this.state.selectedRequest.data.NIF}
                </List.Content>
              </List.Item>
            </List>
          </Segment>
        </div>
      </div>

  )

  showModal() {
    console.log(this.state.selectedRequest);
    

    if(this.state.selectedRequest) {
      
      return (
        <Modal
          open = {this.state.showModal}
          onClose = {() => this.setState({showModal: false})}
        >
          <Modal.Header>Invoice details</Modal.Header>
          <Modal.Content>
            {this.state.hasSelectedRequest ? this.getInvoiceDetailsView(): null}
            <div style = {{marginTop: 30}}>
              <Button color = 'green' onClick = {this.validateRequest}>
                <Icon name = 'check'></Icon>
                  Check invoice
              </Button>
              </div>
          </Modal.Content>
        </Modal>
      )
    }
  }

  closeModal() {
    this.setState({showModal: false})
  }


  validateRequest() {
    this.closeModal()
    this.setState({isLoading: true})
    const keyR = generateRKey(this.state.selectedRequest.KKey)
    const nifAndRHash = generateIdAndNifHash(this.state.selectedRequest.data.NIF ,keyR)
    const invoiceHash = generateInvoiceHash(this.state.selectedRequest.data)
    console.log(nifAndRHash);
    console.log(invoiceHash);

    
    // Todo gene smart contract call: containsInvoice(invoiceHash) returns isValidate
    // const isValidate = containsInvoice(invoiceHash)

    // callback:
    this.onRequestValidated(true)
  }

  onRequestValidated(isValidate) {
    this.setState({
      isRequestValidated: isValidate,
      showValidationMessage: true,
      isLoading: false
    })
  }

  tramitInvoice = () => {
    // invoice is validated from blockchain
    console.log(this.state);
    
    getBankPublicKey().then((publicKey) => {
      console.log(publicKey);
      const hash = generateIdAndNifHash(this.state.selectedRequest.data.NIF, this.state.selectedRequest.data.invoiceID)
      const acceptedInvoiceEntry = {
        hash: hash,
        bankPublicKey: publicKey
      }
      
      createAcceptedInvoice(acceptedInvoiceEntry).then(() => {
        this.setState({
          isRequestValidated: true,
          showValidationMessage: false,
          isLoading: false,
          showAcceptedMessage: true
        })
      }).catch((error) => {
        console.error(error);
        this.setState({
          isRequestValidated: false,
          showValidationMessage: true,
          isLoading: false
        })
      })
      // send accepted entry
    })
  }
 
  rejectRequest(request) {
    this.closeModal()
    this.setState({showValidationMessage: true,
                    isRequestValidated: false})
    //TODO: reject request HOW??
  }

  render() {

    var listItems = null

    if (this.state.requests) {
      const list = this.state.requests
      console.log(this.state.requests);
      
      listItems = list.map((result) => 
        <List.Item key= {result.data.invoiceID}>
          <div id={result.data.invoiceID} onClick = {this.handleItemClick}>
            <Card
              as = 'a'
              header={result.data.invoiceID}
              id = {result.data.invoiceID}
            />  
          </div>
        </List.Item>
      )
    }

      const EmptyRequests = () => (
        this.state.isLoading ?
        null :
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

      const MessageAcceptedRequest = () => (
        <div style = {{marginTop: 30}}>
          <Message
            color = 'green'
            icon
          >
            <Icon name = 'check'></Icon>
            <Message.Content>
              <Message.Header>
                Request accepted
              </Message.Header>
              The request has been accepted
              {/* <div style={{textAlign: 'right'}}>
                <Button style={{marginTop: 10}} className = 'green' onClick={() => this.props.tramitInvoice()}>Proceed</Button>
              </div> */}
              </Message.Content>
          </Message>
        </div>
      )
      return(
        
        <div>
           
          {this.state.isLoading ? 
          <Dimmer active>
            <Loader></Loader>
          </Dimmer>
        :
        null}
          {this.state.hasRequests  ? 
          <div style = {{
            display: 'inline-block',
            textAlign: "left",
            marginTop: 10
          }}>
            <Header as='h2' style = {{marginTop: 25}}>
              <Icon name='file outline' />
              <Header.Content>
                Invoice requests
                <Header.Subheader>Start with the process</Header.Subheader>
              </Header.Content>
            </Header>
            <List items = {listItems} />
            {this.state.selectedRequest !== {} ? this.showModal() : null}
            <div style = {{textAlign: ''}}>
              {this.state.showValidationMessage ? <ValidateRequestComponent isValidate = {this.state.isRequestValidated}
                tramitInvoice = {this.tramitInvoice}
                ></ValidateRequestComponent> : null}
                {this.state.showAcceptedMessage ? <MessageAcceptedRequest/> : null}
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
    console.log(this.props);
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
          color = 'green'
          icon
        >
        
          <Icon name = 'check'></Icon>
          
          <Message.Content>
            <Message.Header>
              Request validated
            </Message.Header>
            The request has been validated and it is safe to proceed with the payment
            <div style={{textAlign: 'right'}}>
              <Button style={{marginTop: 10}} className = 'green' onClick={() => this.props.tramitInvoice()}>Proceed</Button>
            </div>
            </Message.Content>
        </Message>

        {/* THIS IS HARDCODED, TO BE CHANGED WITH REAL INVOICE DATA
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
        </Form> */}
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
    payments: [],
    isLoading: false
  }

  componentDidMount() {
    this.getPayments()
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value})
  }

  handleSubmit() {
    this.setState({
      isLoading: true // hardcoded
    })
    
    if (this.state.invoiceID && this.state.nif.length > 0) {
      console.log(this.state);
      getInvoiceByID(this.state.invoiceID).then((invoice) => {
        console.log(invoice);
        
        if (!isNullOrUndefined(invoice)) {
          this.setState({
            selectedRequest: invoice,
            showInvoiceToPay: true,
            isLoading: false,
            showEmptySearch: false
          })
        } else {
          this.setState({
            showInvoiceToPay: false,
            isLoading: false,
            showEmptySearch: true
          })
        }
      })
      
      const hash = generateIdAndNifHash(this.state.nif, this.state.invoiceID)
      // containsPublicKeyBank(hash).then((isAccepted) => {
      //     if(isAccepted) {
      //       deleteInvoiceByInvoiceID(hash, 'accepted').catch((error) => console.error(error))
      //     }
      //     this.setState({
      //        invoiceNotApprovedYet: isAccepted,
      //        showApprovedMessage: true      
      //     }) 
      // })
    } else {
      this.setState({
        isLoading:false
      })
      alert('Please fill the form correctly')
    }
  }


  getPayments() {
    // TODO: get payments from SM???
    // getFullSignedInvoicesList().then(() => {

    // })
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
    alert('Payed.')
    this.setState({
      showInvoiceToPay: false
    })
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
      <Segment placeholder>
        <Header icon>
          <Icon name='ethereum' />
          We couldn't find any invoice to pay with this data. Try refreshing the page or come back later.
        </Header>
        <Button onClick = {() => window.location.reload()}>
          <Icon name = 'redo'></Icon>
          Reload
        </Button>
      </Segment>
    </div>)

    const InvoiceToPay = () => (
      <div style={{textAlign:'center'}}>
        <div style = {{textAlign: 'left', display: 'inline-block'}}>
          <Segment color = 'black' padded style = {{maxHeight: 400, maxWidth: 250}}>
            <List>
              <List.Item style = {{fontSize: 20}}>
                <List.Header>{this.state.selectedRequest.data.invoiceID}</List.Header>
              </List.Item>
              <List.Item>
                <List.Icon name='euro' />
                <List.Content>Amount: {this.state.selectedRequest.data.amount}€</List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='calendar alternate outline' />
                <List.Content>
                  Emission date: {this.state.selectedRequest.data.emissionDate}
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='calendar times outline' />
                <List.Content>
                  Expiration date: {this.state.selectedRequest.data.expirationDate}
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='id card outline' />
                <List.Content>
                  NIF: {this.state.selectedRequest.data.NIF}
                </List.Content>
              </List.Item>
            </List>
            <div style={{textAlign : 'right'}}>
              <Button color = 'red'>
                <Icon name = 'cancel'></Icon>
                  Cancel
              </Button>
              <Button color = 'green' onClick = {this.paySelectedInvoice.bind(this)}>
                <Icon name = 'payment'></Icon>
                  Pay
              </Button>
            </div>
          </Segment>
        </div>
      </div>
    )


    return(
      <div>
        <Header as='h2' style = {{marginTop: 25}}>
          <Icon name='payment' />
          <Header.Content>
            Introduce client data
            <Header.Subheader>Proceed with the invoice payment</Header.Subheader>
          </Header.Content>
        </Header>
        <Grid>
          <GridColumn width = {6}>
            <Form>
              <Form.Input type='text' name = 'nif' value = {this.state.nif} label='NIF' placeholder='1726341Q' onChange = {this.handleChange.bind(this)}/>
              <Form.Input type='number' name = 'invoiceID' value = {this.state.invoiceID} label='Invoice number'
                          placeholder='80085' onChange = {this.handleChange.bind(this)}/>          
              <Button type='submit' className = 'primary' onClick = {this.handleSubmit.bind(this)}>
                  <Icon name = 'search' />
                  Search
              </Button>
            </Form>
          </GridColumn>
          <GridColumn width = {6}>
            {this.state.isLoading ? 
              <Dimmer active>
                <Loader></Loader>
              </Dimmer>
            :
            null}
            {this.state.showInvoiceToPay ? <InvoiceToPay/> : null}
            {this.state.showEmptySearch ? <EmptyPayments/>: null}
          </GridColumn>
        </Grid>
      </div>
    )
  }
}

// SIGNATURES

class SignmentsComponent extends Component {
  state = {
    nif: '',
    invoiceID: '',
    isLoading: false,
    invoiceNotApprovedYet: false,
    showApprovedMessage: false,
    showSignForm: false,
    accountNumber: '',
    comission: ''
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value})
  }

  handleSubmit() {
    
    if (this.state.invoiceID && this.state.nif.length > 0) {
      console.log(this.state);
      
      this.setState({
        isLoading: true,
        invoiceNotApprovedYet: true, // hardcoded
        showApprovedMessage: true    // hardcoded
      })
      const hash = generateIdAndNifHash(this.state.nif, this.state.invoiceID)
      // containsPublicKeyBank(hash).then((isAccepted) => {
      //     if(isAccepted) {
      //       deleteInvoiceByInvoiceID(hash, 'accepted').catch((error) => console.error(error))
      //     }
      //     this.setState({
      //        invoiceNotApprovedYet: isAccepted,
      //        showApprovedMessage: true      
      //     }) 
      // })
    } else {
      alert('Please fill the form correctly')
    }
  }

  signInvoice() {
    // encrypt with k the data
    // Borra la factura de invoice
    // Añade el acc number del bank
    // Sign
    this.setState({
      showSignForm: true
    })
    this.handleSignFormChange = this.handleSignFormChange.bind(this)
  }

  handleSignFormChange(event) {
    console.log(event.target.name)
    console.log(event.target.value)
    this.setState({[event.target.name]: event.target.value})
    console.log(this.state);
    
  }

  handleSignFormSubmit() {
    // created signed invoice
    console.log(this.state);
    alert('Successfully signed invoice, now you will be redirected to the payments section')
    const payments = document.getElementById('payments')
    payments.click()
  }

  render(){

    const ApprovedMessage = (isApproved) => (
      <Message color = {isApproved ? 'green':'red'}>
        <Icon name = {isApproved ? 'check':'cancel'}></Icon>
            <Message.Content>
              <Message.Header>
              {isApproved ? 'Approved Invoice': 'Invoice not reviewed yet'}
              </Message.Header>
              {isApproved ? 'The invoice was successfully approved and can be safely signed.' : 'The invoice has not been reviewed yet and you cannot proceed with the signature.'}
              {isApproved ? 
                <div style={{textAlign: 'right'}}>
                  <Button style={{marginTop: 10}} className = 'green' onClick={this.signInvoice.bind(this)}>Sign</Button>
                </div> : null
              }
              </Message.Content>
      </Message>
    )

    const InvoiceSignForm = () => {
      return(
        <Form>
            <Form.Input type='text' name = 'accountNumber' value = {this.state.accountNumber} label='Account number' placeholder='ES67 1627 1263 1263 1234' onChange = {this.handleSignFormChange}/>
            
            <Form.Input type='number' name = 'comission' value = {this.state.comission} label='Comission(%)' placeholder='3%' onChange = {this.handleSignFormChange.bind(this)}/>                   
            <Button type='submit' className = 'primary' onClick = {this.handleSignFormSubmit.bind(this)}>
                <Icon name = 'check' />
                Confirm signature
            </Button>
        </Form>
      )
    }

    return (
      // <Segment className='huge'>ARRIBA ESPAÑA</Segment>
      <div>
        
        <Header as='h2' style = {{marginTop: 25}}>
          <Icon name='search' />
          <Header.Content>
            Introduce client data
            <Header.Subheader>Search for invoices to sign</Header.Subheader>
          </Header.Content>
        </Header>
        <Grid>
          <GridColumn width= {6}>
            <Form>
                <Form.Input type='text' name = 'nif' value = {this.state.nif} label='NIF' placeholder='1726341Q' onChange = {this.handleChange.bind(this)}/>
                <Form.Input type='number' name = 'invoiceID' value = {this.state.invoiceID} label='Invoice number'
                            placeholder='80085' onChange = {this.handleChange.bind(this)}/>          
                <Button type='submit' className = 'primary' onClick = {this.handleSubmit.bind(this)}>
                    <Icon name = 'search' />
                    Search
                </Button>
            </Form>
            {this.state.showApprovedMessage ? <ApprovedMessage isApproved = {this.state.invoiceNotApprovedYet}></ApprovedMessage> : null}
          </GridColumn>
          <GridColumn width= {6}>
            {this.state.showSignForm ? <InvoiceSignForm/> : null}
          </GridColumn>
        </Grid>
      </div>
    )
  }
}

export default Creditor;
