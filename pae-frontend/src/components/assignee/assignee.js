import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {fire, database} from '../../config/fire';
import { browserHistory } from "react-router";
import {
  Button,
  Container,
  Modal,
  Grid,
  Header,
  Icon,
  Image,
  List,
  Dimmer,
  Loader,
  Message,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Card,
  GridColumn,
  GridRow,
  Form
} from 'semantic-ui-react'
import { getPublicKey, getAcmeSCAddress, createInvoice, getInvoicesList } from '../../managers/firebaseManager';
import { generateBankKeyPairs,toUint8Array,toString,signMessage,checksign} from '../../utils/crypto_hash_sign';
import * as nacl from 'tweetnacl';
class Assignee extends Component {
  render() {
    return <DesktopContainer/>;
  }
}

// export default Assignee;
/* Heads up!
 * Neither Semantic UI nor Semantic UI React offer a responsive navbar, however, it can be implemented easily.
 * It can be more complicated, but you can create really flexible markup.
 */
class DesktopContainer extends Component {
  state = {
    isTramitShown: true,
    acmeSCAddress: ''
  }

  onMenuOptionChange = () => {
    this.setState({isTramitShown : !this.state.isTramitShown})
  }

   async componentDidMount(){
  //  this.getAcmeAddress()
      var firebaseRef = fire.database().ref()
      // generar claves
      let claves= nacl.sign.keyPair()
      //firmar mensaje
      console.log('tipos :'+typeof(toUint8Array('mensaje para firmar')) + '   ' +typeof(claves.secretKey)+ '   '+typeof(new Uint8Array(5))) 
      let mensajeF=nacl.sign(toUint8Array('mensaje para firmar'),claves.secretKey)
      console.log('antes de enviar a Firebase'+typeof(mensajeF)+   ':'+mensajeF)

      //to FireBase
      await firebaseRef.child('unsignedInvoices/7777777777/data').update({RKey: mensajeF})
      //from  FireBase
      let snapshot=await firebaseRef.once("value")
       mensajeF=await  snapshot.child(`unsignedInvoices/7777777777/data/RKey`).val()
       console.log(' La que devuelve Firebase'+typeof(mensajeF)+   ':'+mensajeF)
       // comprabar firmar
       mensajeF= new Uint8Array(mensajeF)
       console.log('cambiado '+typeof(mensajeF)+   ':'+mensajeF)
       nacl.sign.open(mensajeF,claves.publicKey)? console.log('correcto'):console.log('error')
       // quitar firma
       console.log( toString(mensajeF.slice(64,mensajeF.length)))
     }


    //this.getaPublicKey()
  /*  console.log(firebaseRef.once("value")
   .then(function(snapshot) {
   return (snapshot.child(`unsignedInvoices`).val())
 }));
  }*/

  getAcmeAddress() {
    getAcmeSCAddress().then((address) => {
      this.setState({acmeSCAddress: address})
      console.log(address)
    })
  }
  getaPublicKey() {
    getPublicKey().then((value) => {
      let array = value.split(",");
      let a = new Array();
      array.forEach(function(num){
        let b = new TextEncoder("utf-8").encode(num)
        a.push(b)
        console.log(typeof(b))
      });
      console.log("Esta es la public key: "+typeof(a), a);
    })
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
                  {this.state.isTramitShown ? <InvoiceForm acmeSCAddress = {this.state.acmeSCAddress} style = {{maxHeight: window}}/> : <InvoiceSearch />}
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
  state = { activeItem: 'tramitar' }

  handleItemClick = (e, { name }) => {
    if (this.state.activeItem !== name) {
      this.setState({ activeItem: name })
      this.props.changeMenuOption();
    }
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
            Assignee
          </Header.Content>
        </Header>
        <Menu pointing secondary vertical inverted>
          <Menu.Item
            name='transact'
            active={  activeItem === 'tramitar'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name='check'
            active={activeItem === 'consultar'}
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

//
//
//
//
//
//
//Invoice Form
//
//
//
//
//

class InvoiceForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
                  invoiceNumber: '',
                  nif: '',
                  amount: '',
                  emissionDate: '',
                  expirationDate: '',
                  toDebtorAccount: '',
                  toCreditorAccount: '',
                  acmeSCAddress: '',
                  KKey : '',
                  RKey: ''
                };
    //TODO: Confirm the fields needed
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

  handleSubmit(event) {
    //TODO: Upload invoice to the blockchain and Sign it

    if(this.validateForm()){

      createInvoice(this.state).then(() => {
        window.alert('Successfully uploaded invoice')
      }).catch((error) => (console.error(error)))
    } else {
      window.alert('Please fill the form correctly')
    }
  }

  componentDidUpdate() {
    if (this.state.acmeSCAddress !== this.props.acmeSCAddress) {
      this.setState({acmeSCAddress: this.props.acmeSCAddress})
    }
  }

  validateForm(){
    return(this.state.invoiceNumber && this.state.nif && this.state.amount &&
      this.state.emissionDate && this.state.expirationDate &&
      this.state.toDebtorAccount && this.state.toCreditorAccount && this.isAccountsValid())
  }

  isAccountsValid() {
    var expressionCreditor = /[a-zA-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}/gm;
    var expressionDebtor = /[a-zA-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}/gm;

    const isCreditorValid = expressionCreditor.test(this.state.toCreditorAccount)
    const isDebtorValid = expressionDebtor.test(this.state.toDebtorAccount)
    return isCreditorValid && isDebtorValid
  }

  render() {
    return (

      <Form>
        <Form.Field>
          <label>Invoice number</label>
          <input placeholder='Invoice number'
            name = 'invoiceNumber'
            type = 'number'
            value = {this.state.invoiceNumber}
            onChange = {this.handleChange}
          />
        </Form.Field>
        <Form.Field>
          <label>CIF/NIF</label>
          <input placeholder='11111111A'
            name = 'nif'
            type = 'text'
            value = {this.state.nif}
            onChange = {this.handleChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Total amount</label>
          <input placeholder='150.5'
            name = 'amount'
            type = 'number'
            value = {this.state.amount}
            onChange = {this.handleChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Emission date</label>
          <input placeholder='MM/DD/AAAA'
            name = 'emissionDate'
            type = 'date'
            value = {this.state.emissionDate}
            onChange = {this.handleChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Expiration date</label>
          <input placeholder='MM/DD/AAAA'
            name = 'expirationDate'
            type = 'date'
            value = {this.state.expirationDate}
            onChange = {this.handleChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Debtor payment account</label>
          <input placeholder='ESXX XXXX XXXX XXXX XXXX XXXX'
            name = 'toDebtorAccount'
            type = 'text'
            value = {this.state.toDebtorAccount}
            onChange = {this.handleChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Creditor payment account</label>
          <input placeholder='ESXX XXXX XXXX XXXX XXXX XXXX'
            name = 'toCreditorAccount'
            type = 'text'
            value = {this.state.toCreditorAccount}
            onChange = {this.handleChange}
          />
        </Form.Field>
        <Button className='primary' type='submit' onClick = {this.handleSubmit.bind(this)}>Upload invoice</Button>
      </Form>
    );
  }
}

//
//
//
//
//
//
//Consultar
//
//
//
//
//
//
class InvoiceSearch extends Component{

  constructor(props) {
    super(props);
    //this.handleChange = this.handleChange.bind(this);
    this.signInvoice = this.signInvoice.bind(this);
    this.dontSignInvoice = this.dontSignInvoice.bind(this);
    //this.rejectRequest = this.rejectRequest.bind(this);
    this.state = {
      selectedRequest: {},
      showModal: false,
      showValidationMessage: false,
      isInvoiceSigned: true,
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
    getInvoicesList('assignee').then((res) => {
      this.setState({
        requests: res,
        isLoading: false,
        hasRequests: res.length > 0
      })
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
          <Segment color = 'black' padded style = {{maxHeight: 400, minWidth: 250}}>
            <List>
              <List.Item style = {{fontSize: 20}}>
                <List.Header>Invoice info</List.Header>
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
                <List.Icon name='calendar times outline' />
                <List.Content>
                  Commision: 8%
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='balance scale'/>
                <List.Content>
                  Reciever account: {this.state.selectedRequest.toCreditorAccount}
                </List.Content>
              </List.Item>
              <List.Item>

                <List.Content>
                  Signed by bank:
                  <List.Icon name='check'/>
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
              <Button color = 'green' onClick = {this.signInvoice}>
                <Icon name = 'check'></Icon>
                  Sign Invoice
              </Button>
              <Button color = 'grey' onClick = {this.dontSignInvoice}>
                <Icon name = 'undo'></Icon>
                  Go back
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



  signInvoice() {
    this.closeModal()
    this.setState({showValidationMessage: true,
                    isInvoiceSigned: true})
    var fromHere = 1
    this.state.requests.indexOf(this.state.selectedRequest)
    const list = this.state.requests.splice(fromHere, 3)
    this.setState({
      requests : list
    })

    this.onRequestValidated()
  }

  dontSignInvoice() {
    this.closeModal()
    this.setState({showValidationMessage: true,
                    isInvoiceSigned: false})
    this.onRequestValidated()
  }

  // public key sent to firebase callback
  onRequestValidated() {
      // Todo smart contract call: containsPublicKeyBank(hash(public_key))
      // if true:
      //
      // this.setState({showValidationMessage: true,
      //                isInvoiceSigned: true})

  }

  /*rejectRequest(request) {
    this.closeModal()
    this.setState({showValidationMessage: true,
                    isInvoiceSigned: false})
    //TODO: reject request HOW??
  }*/

  showValidationMessage() {
    return (<SignInvoiceComponent isSigned = {this.state.isInvoiceSigned}></SignInvoiceComponent>)
  }

  render() {

    var listItems = null

    if (this.state.requests) {
      const list = this.state.requests
      console.log(this.state.requests);

      listItems = list.map((result) =>

        <List.Item style = {{minWidth: 250}} key= {result.data.invoiceID}>
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
            <Header as='h2' style = {{marginTop: 25}}>
              <Icon name='file outline' />
              <Header.Content>
                Signed invoices by a creditor
              </Header.Content>
            </Header>
            <List items = {listItems} />
            {this.state.selectedRequest !== {} ? this.showModal() : null}
            <div style = {{textAlign: ''}}>
              {this.state.showValidationMessage ? <SignInvoiceComponent isSigned = {this.state.isInvoiceSigned}></SignInvoiceComponent> : null}
            </div>
          </div>
          :
          <EmptyInvoices/>}
        </div>
      )
  }
}

class SignInvoiceComponent extends Component {
  state = {
    isSigned: this.props.isSigned,
    isOfferSent: false
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ isSigned: nextProps.isSigned });
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
        header='Invoice not signed'
        content='The invoice has not been signed.'
        color = 'grey'
      />
    )

    return(
      <div style={{maxWidth: 800, minWidth:800}} >
        {this.state.isSigned ? (<MessageValidatedRequest />) : (<MessageNotValidatedRequest />)}
      </div>
    )
  }
}
export default Assignee
