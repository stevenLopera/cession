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
  Message,
  GridRow,
  Form,
  Dimmer,
  Loader
} from 'semantic-ui-react'  
import 'semantic-ui-css/semantic.min.css';
import {fire, database} from '../../config/fire';
import { browserHistory } from "react-router";
import {
  DateInput
} from 'semantic-ui-calendar-react';
import { getInvoicesList, resolveInvoice, getAcmeInvoicesList, getFullSignedInvoicesList} from '../../managers/firebaseManager';
//import { sha3_512 } from 'js-sha3';
//import Web3 from 'web3';
import { generateInvoiceHash } from '../../utils/crypto_hash_sign';

class Debtor extends Component {
  render() {
    return <div>Debtor</div>;
  }
}

// export default Assignee;
/* Heads up!
 * Neither Semantic UI nor Semantic UI React offer a responsive navbar, however, it can be implemented easily.
 * It can be more complicated, but you can create really flexible markup.
 */
class DesktopContainer extends Component {
  state = {
    isTramitShown: true
  }

  onMenuOptionChange = () => {
    this.setState({isTramitShown : !this.state.isTramitShown})
  }

  render() {
    const { children } = this.props
    const { visible } = this.state

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
                  {this.state.isTramitShown ? <InvoiceForm /> : <InvoiceSearch />}
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


class MobileContainer extends Component {
  state = {}

  handlePusherClick = () => {
    const { sidebarOpened } = this.state

    if (sidebarOpened) this.setState({ sidebarOpened: false })
  }

  handleToggle = () => this.setState({ sidebarOpened: !this.state.sidebarOpened })

  render() {
    const { children } = this.props
    const { sidebarOpened } = this.state

    return (
      <Responsive maxWidth={Responsive.onlyMobile.maxWidth}>
        <Sidebar>
          <Sidebar as={Menu} animation='uncover' inverted vertical visible={sidebarOpened}>
            <Menu.Item as='a' active>
              Home
            </Menu.Item>
            <Menu.Item as='a'>Work</Menu.Item>
            <Menu.Item as='a'>Company</Menu.Item>
            <Menu.Item as='a'>Careers</Menu.Item>
            <Menu.Item as='a'>Log in</Menu.Item>
            <Menu.Item as='a'>Sign Up</Menu.Item>
          </Sidebar>

          <Sidebar.Pusher
            dimmed={sidebarOpened}
            onClick={this.handlePusherClick}
            style={{ minHeight: '100vh' }}
          >
            <Segment
              inverted
              textAlign='center'
              style={{ minHeight: 350, padding: '1em 0em' }}
              vertical
            >
              <Container>
                <Menu pointing secondary size='large'>
                  <Menu.Item onClick={this.handleToggle}>
                    <Icon name='sidebar' />
                  </Menu.Item>
                  <Menu.Item position='right'>
                    <Button as='a' inverted>
                      Log in
                    </Button>
                    <Button as='a' inverted style={{ marginLeft: '0.5em' }}>
                      Sign Up
                    </Button>
                  </Menu.Item>
                </Menu>
              </Container>
              {/* <HomepageHeading mobile /> */}
            </Segment>

            {children}
          </Sidebar.Pusher>
        </Sidebar>
      </Responsive>
    )
  }
}

MobileContainer.propTypes = {
  children: PropTypes.node,
}

class SideMenuVertical extends Component {
  state = { activeItem: 'tramitaciones' }

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name })
    //TODO: Open Tramit Component or Consultar component depending on the active item
    this.props.changeMenuOption();
  }
  logout() {
      fire.auth().signOut();
      browserHistory.push("/login");
  }

  render() {
    const { activeItem } = this.state

    return (
      <div>
        <Header as='h2' style = {{marginTop: 25}} inverted>
          <Icon name='user circle' />
          <Header.Content>
            Government
          </Header.Content>
        </Header>
        <Menu pointing secondary vertical inverted>
          <Menu.Item
            name='transactions'
            active={  activeItem === 'transactions'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name='payments'
            active={activeItem === 'payments'}
            onClick={this.handleItemClick}
          />
          
          <Button color = 'red' onClick = {this.logout}> Logout </Button> 

        </Menu>
        
      </div>  
    )
  }  
}

SideMenuVertical.propTypes = {
  changeMenuOption : PropTypes.func
}

class InvoiceForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      invoiceNumber: '',
      nif: '',
      amount: '',
      keyR: '',
      emissionDate: '',
      expirationDate: '',
      activeItem: {}, 
      showModal: false,
      invoiceSended: false,
      results: [],
      isLoading: true,
      isResolved: false
    };
    //TODO: Confirm the fields needed
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.resolveActiveInvoice = this.resolveActiveInvoice.bind(this)
    this.getInvoices = this.getInvoices.bind(this)
  }

  handleItemClick = (event) => {
    // Only way found to detect the element clicked
    const activeItemName = event.target.parentNode.parentNode.id
    
    const activeItem = this.state.results.find((item) => item.invoiceID === activeItemName)

    console.log(activeItem);
    
    this.setState({
      activeItem: activeItem,
      showModal: true,
    })
  }
  handleChange(event) {

    console.log(event) 

    const target = event.target;
    const value = event.value ? event.value : target.value
    const name = target.name;
    

    this.setState({
      [name]: value
    });
  }

  getInvoices() {
    getInvoicesList('debtor').then((res) => {
      this.setState({
        results: res,
        isLoading: false
      })
      console.log('promise returned');
      
    })
  }

  componentDidMount(){
    this.getInvoices()
  }

  handleSubmit(event) {
    console.log(this.state)
    
    //acceptHash();
  }
  showModal() {
    console.log(this.state);

    if(this.state.activeItem) {
      return (
        
        <Modal
         open = {this.state.showModal}
           onClose = {() => this.setState({showModal: false})}
        >
          <Modal.Header>Invoice details</Modal.Header>
          <Modal.Content>
            {this.getInvoiceDetailsView()}
            <div style={{marginTop: 30, textAlign:'right'}}>
              <Button className='green' onClick = {() => this.resolveActiveInvoice(true)}><Icon name='check' />Pay invoice</Button>
              <Button className='red' onClick = {() => this.resolveActiveInvoice(false)}><Icon name='cancel' />Reject invoice</Button>
            </div>
          </Modal.Content>
        </Modal>
      )
       
    }
  }
  onModalClose() {
    this.setState({
      showModal: false,
    })
  }

  resolveActiveInvoice(isAccepted){
    this.onModalClose()

    this.setState({isLoading: true})
    //var hash = keccak256.update(invoice);

    if (isAccepted) {
   //   generateInvoiceHash(this.state.activeItem)
      // todo call acceptInvoice(hash) 
    }
    
    resolveInvoice(this.state.activeItem.invoiceID).then(() => {
      console.log('invoiceResolved')
      this.setState({
        invoiceSended: isAccepted,
        isResolved: true
      })
      this.getInvoices()
    }).catch((err) => {
      console.error(err);
    })
  }

  showSuccessfullySendedMessage(){
    let nifAux = this.state.activeItem.NIF
    let amountAux = this.state.activeItem.amount
    let invoiceIDAux = this.state.activeItem.invoiceID

    return (<SuccessfullySendedInvoiceMsg nif = {nifAux} amount = {amountAux} invoiceNumber = {invoiceIDAux} invoiceSended = {this.state.invoiceSended}></SuccessfullySendedInvoiceMsg>)
  }

  onMessageShown() {
    // reset activeItem
    this.setState({
      activeItem: {}
    })
  }

  getInvoiceDetailsView = () => (
    
    <div style={{textAlign:'center'}}>
        <div style = {{textAlign: 'left', display: 'inline-block'}}>
          <Segment color = 'black' padded style = {{maxHeight: 400, maxWidth: 500}}>
            <List>
              <List.Item style = {{fontSize: 20}}>
                <List.Header>{this.state.activeItem.invoiceID}</List.Header>
              </List.Item>
              <List.Item>
                <List.Icon name='euro' />
                <List.Content>Amount: {this.state.activeItem.amount}€</List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='calendar alternate outline' />
                <List.Content>
                  Emission date: {this.state.activeItem.emissionDate}
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='calendar times outline' />
                <List.Content>
                  Expiration date: {this.state.activeItem.expirationDate}
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='id card outline' />
                <List.Content>
                  Account to pay: ES23273994837291744372
                </List.Content>
              </List.Item>
            </List>
          </Segment>
        </div>
      </div>

  )

  render() {
    var listItems = null

    if (this.state.results) {
      const list = this.state.results
      console.log(this.state.results);
      
      listItems = list.map((result) => 
        <List.Item key= {result.invoiceID}>
          <div id={result.invoiceID} onClick = {this.handleItemClick}>
            <Card
              as = 'a'
              header={result.invoiceID}
              id = {result.invoiceID}
            />  
          </div>
        </List.Item>
      )
    }

    

    return(
      <div style = {{
        display: 'inline-block',
        textAlign: "left"
      }}>
        {this.state.isLoading ? 
          <Dimmer active>
            <Loader></Loader>
          </Dimmer>
        :
        null}
        <Header as='h2' style = {{marginTop: 25}}>
              <Icon name='file outline' />
              <Header.Content>
                Invoices to pay
              </Header.Content>
            </Header>
        <List items = {listItems} />
        {this.showModal()}
        <div style = {{textAlign: ''}}>
          {this.state.isResolved ? this.showSuccessfullySendedMessage() : null}
          
        </div>
      </div>
    )
  }
}

class SuccessfullySendedInvoiceMsg extends Component{
  state = {
    invoiceSended : this.props.invoiceSended,
    nif: this.props.nif,
    amount: this.props.amount,
    invoiceNumber: this.props.invoiceNumber
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ invoiceSended: nextProps.invoiceSended });  
  }

  handleChange(event) {
    console.log(event.target)
    this.setState({[event.target.name]: event.target.value})
  }
  render() {
    
    const MessageSended = () => (
      <div style = {{marginTop: 30}}>
        <Message
          icon='check'
          header='Invoice result'
          content='The invoice has been paid.'
          color = 'green'
          style = {{textAlign: 'left'}}
        />
        <div style={{textAlign:'center'}}>
          <div style = {{textAlign: 'left', display: 'inline-block'}}>
            <Segment color = 'black' padded style = {{maxHeight: 600, maxWidth: 400}}>
              <List>
                <List.Item style = {{fontSize: 20}}>
                  <List.Header>Invoice details</List.Header>
                </List.Item>
                <List.Item>
                  <List.Icon name='users'/>
                  <List.Content>NIF: {this.state.nif}</List.Content>
                </List.Item>
                <List.Item>
                  <List.Icon name='euro'/>
                  <List.Content>Amount: {this.state.amount}€</List.Content>
                </List.Item>
                <List.Item>
                  <List.Icon name='file'/>
                  <List.Content>Invoice Number: {this.state.invoiceNumber}</List.Content>
                </List.Item>
              </List>
            </Segment>
          </div>
        </div>
      </div>)

    const MessageNotSended = () => (
      <Message
        icon='cancel'
        header='Invoice not sent'
        content='The invoice has not been sent to the Blockchain.'
        color = 'red'
      />
    )
      /* THIS IS HARDCODED, TO BE CHANGED WITH REAL INVOICE DATA 
        
        
        

    const MessageNotValidatedRequest = () => (
      <Message
        icon='cancel'
        header='Request validation failed'
        content='The request has not been validated.'
        color = 'red'
      />
    )
    */
    
    return(
      <div style={{maxWidth: 1000, minWidth:1000}} >
        {this.state.invoiceSended ? (<MessageSended />) : (<MessageNotSended />)}
      </div>
    )
  }
}

//
//
//
/*
class InvoiceSearch extends Component{
  constructor(props) {
    super(props);
    //this.handleChange = this.handleChange.bind(this);
    this.payInvoice = this.payInvoice.bind(this);
    //this.rejectRequest = this.rejectRequest.bind(this);
    this.state = {
      selectedRequest: {},
      showModal: false,
      showValidationMessage: false,
      isInvoicePaid: false,
      hasRequests: false,
      isLoading: true,
      requests: [],
      hasSelectedRequest: false
    } 
    this.getRequests = this.getRequests.bind(this)
  }

  componentDidMount() {
    this.getRequests()
  }

  getRequests() {
    getInvoicesList('debtor').then((res) => {
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
    
    const activeItem = this.state.requests.find((item) => (item.invoiceID === activeItemName))
    this.setState({
      selectedRequest: activeItem,
      showModal: true,
      hasSelectedRequest: true
    })
  }

  getInvoiceDetailsView = () => (
   <div style={{textAlign:'center'}}>
        <div style = {{textAlign: 'left', display: 'inline-block'}}>
          <Segment color = 'black' padded style = {{maxHeight: 400, minWidth: 250}}>
            <List>
              <List.Item style = {{fontSize: 20}}>
                <List.Header>Invoice info</List.Header>
              </List.Item>
              <List.Item>
                <List.Content>
                  Creditor Account: {this.state.selectedRequest.toCreditorAccount}
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Content>
                  Debtor Account: {this.state.selectedRequest.toDebtorAccount}
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Content>
                  Comission: 8%
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Content>
                  Total Amount to Pay: {this.state.selectedRequest.data.amount*1.08}
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
              <Button color = 'green' onClick = {this.payInvoice}>
                <Icon name = 'check'></Icon>
                  Pay Invoice
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


  payInvoice(request) {
    this.closeModal()
    this.setState({showValidationMessage: true,
                    isInvoicePaid: true})
    //TODO: accept request HOW??
    
    //TODO send public key to firebase
    // callback:
    this.onRequestValidated()
  }

  onRequestValidated() {

  }

  showValidationMessage() {
    return (<PayInvoiceComponent isValidate = {this.state.isInvoicePaid}></PayInvoiceComponent>)
  }

  render() {

    var listItems = null

    if (this.state.requests) {
      const list = this.state.requests
      console.log(this.state.requests);
      
      listItems = list.map((result) => 
        
        <List.Item style = {{minWidth: 250}} key= {result.invoiceID}>
        {console.log(result)}
          <div id={result.invoiceID} onClick = {this.handleItemClick}>
            <Card
              as = 'a'
              header={result.invoiceID}
              id = {result.invoiceID}
            />  
          </div>
        </List.Item>
      )
    }

      const EmptyInvoices = () => (
        <Segment placeholder style={{minHeight: 600}}>
              <Header icon>
                <Icon name='file outline' />
                There are not any invoices at the moment. Try refreshing the page or come back later.
              </Header>
              <Button onClick = {() => window.location.reload()}>
                <Icon name = 'redo'></Icon>
                Reload
              </Button>
          </Segment>
      )

      return(
        
        <div>
          {this.state.isLoading ? 
          <Dimmer active>
            <Loader></Loader>
          </Dimmer>
        :
        null}
          {this.state.hasRequests ? 
          <div style = {{
            display: 'inline-block',
            textAlign: "left"
          }}>
            <List items = {listItems} />
            {this.state.selectedRequest !== {} ? this.showModal() : null}
            <div style = {{textAlign: ''}}>
              {this.state.showValidationMessage ? <PayInvoiceComponent isValidate = {this.state.isInvoicePaid}></PayInvoiceComponent> : null}
            </div>
          </div>
          :
          <EmptyInvoices/>}
        </div>
      )
  }
}

class PayInvoiceComponent extends Component {
  state = {
    isValidate: this.props.isValidate,
    isOfferPaid: false
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
        isOfferPaid: true
      })
    }
    console.log(this.state)
  }

  handleChange(event) {
    console.log(event.target)
    this.setState({[event.target.name]: event.target.value})
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
      </div>
    )
    
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

}*/

class InvoiceSearch extends Component{
  constructor(props) {
    super(props);
    this.state = {KeyR: '',
                  DirAcme: '', //es necesaria?
                  hasResults: false,
                  showModal: false,
                  isInvoiceValidated: false,
                  showValidationMessage: false}; 

    this.handleChange = this.handleChange.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.search = this.search.bind(this);
    this.payInvoice = this.payInvoice.bind(this);
    
  }
  componentDidMount() {
    this.setState({
      isLoading: false
    })
  }

  componentDidUpdate(){
    console.log(this.state.showModal)
    this.showModal()
  }
  handleChange(event) {
    this.setState({KeyR: event.target.value});
    
  }
  handleChange2(event) {
    this.setState({DirAcme: event.target.value});
  
  }
  handleSubmit(event) {
    //alert('A key was submitted: ' + this.state.invoiceKey);
    event.preventDefault();
    //TODO: Query the smart contract
    // add a loading spinner, hide the form and show result?
    this.setState({
      //showModal:true
    })
  }
  handleItemClick = (event) => {
    // Only way found to detect the element clicked
    const activeItemName = event.target.parentNode.parentNode.id
    
    const activeItem = this.state.requests.find((item) => (item.invoiceID === activeItemName))
    this.setState({
      showModal: true
    })
  }

  getInvoiceDetailsView = () => (
   <div style={{textAlign:'center'}}>
        <div style = {{textAlign: 'left', display: 'inline-block'}}>
          <Segment color = 'black' padded style = {{maxHeight: 400, minWidth: 250}}>
            <List>
              <List.Item style = {{fontSize: 20}}>
                <List.Header>Invoice info</List.Header>
              </List.Item>
              <List.Item>
                <List.Content>
                  Creditor Account: ES2324244433444443324378 {/*this.state.selectedRequest.toCreditorAccount*/}
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Content>
                Debtor Account: ES2324244433444443324378{/*this.state.selectedRequest.toDebtorAccount*/}
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Content>
                  Comission: 8%
                </List.Content>
              </List.Item>
              
            </List>
          </Segment>
        </div>
      </div>

  )

  showModal() {
    return (
      <Modal
        open = {this.state.showModal}
        onClose = {() => this.setState({showModal: false})}
      >
        <Modal.Header>Invoice details</Modal.Header>
        <Modal.Content>
          {this.getInvoiceDetailsView()}
          <div style = {{marginTop: 30}}>
            <Button color = 'green' onClick = {this.payInvoice}>
              <Icon name = 'check'></Icon>
                Pay Invoice
            </Button>
            </div>
        </Modal.Content>
      </Modal>
    )
    
  }
  payInvoice(){
    this.closeModal()
    this.setState({showValidationMessage: true,
      isInvoiceValidated: true})
  }
  closeModal() {
    this.setState({showModal: false})
  }
  render() {
    return (
      <Container>
        <Header as='h2' style = {{marginTop: 25}}>
          <Icon name='file outline' />
          <Header.Content>
            Search invoice
          </Header.Content>
        </Header>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Hash</label>
            <input placeholder='17ghteve11bb04e00b10a30f5b8366c234cab81ab0f6b7a3aa542c3858907a39a' 
              name = 'Hash'
              value = {this.state.invoiceKey}
              type = 'text'
              onChange = {this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <label>NIF</label>
            <input placeholder='48513241J' 
              name = 'NIF'
              value = {this.state.DirAcme}
              type = 'text'
              onChange = {this.handleChange2}
            />
          </Form.Field>
          
        </Form>
        <Container style = {{
          marginTop: 20,
          textAlign: 'center'
        }}>
          {this.state.showModal !== {} ? this.showModal() : null}
          <Button  className='primary' onClick = {this.search} >Search Payment</Button>
          <div style = {{textAlign: ''}}>
              {this.state.showValidationMessage ? <SendInvoiceComponent isValidate = {this.state.isInvoiceValidated}></SendInvoiceComponent> : null}
          </div>
        </Container>
      </Container>
    )
  }

  search() {
    this.setState({
      showModal: true
      })
      console.log('123123123123')
  }
  

}

class SendInvoiceComponent extends Component {
  state = {
    isValidate: this.props.isValidate,
    isOfferSent: false
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



  render() {
    
    const MessageValidatedRequest = () => (
      <div style = {{marginTop: 30}}>
        <Message
          icon='check'
          header='Request paid'
          content='The request has been paid'
          color = 'green'
          style = {{textAlign: 'left'}}
        />
      </div>
    )
    
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
class FindPayments extends Component {
  
  
  //Buscar el pago con esa clave y a esa direccion
  
}



const ResponsiveContainer = ({ children }) => (
  <div>
    <DesktopContainer>{children}</DesktopContainer>
    <MobileContainer>{children}</MobileContainer>
  </div>
)

ResponsiveContainer.propTypes = {
  children: PropTypes.node,
}

const DebtorLayout = () => (
  <ResponsiveContainer>
    
  </ResponsiveContainer>
)

export default DebtorLayout