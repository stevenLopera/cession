import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {fire, database} from '../../config/fire';
import { browserHistory } from "react-router";
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
import { getAcmeInvoicesList, getFullSignedInvoicesList} from '../../managers/firebaseManager';

class Acme extends Component {
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
                  {this.state.isRequestsShown ? <AcceptedInvoicesComponent /> : <SignedInvoicesComponent />} 
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
  logout() {
    fire.auth().signOut();
    browserHistory.push("/login");
  }   

  render() {
    const { activeItem } = this.state

    return (
      <Menu pointing secondary vertical inverted>
        <Menu.Item
          name='Accepted Invoices'
          active={  activeItem === 'acceptedInvoices'}
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='Signed Invoices'
          id = 'signedInvoices'
          active={activeItem === 'signedInvoices'}
          onClick={this.handleItemClick}
        />
        <Button color = 'red' onClick = {this.logout}> Logout </Button> 
      </Menu>
    )
  }
}



// REQUESTS


class AcceptedInvoicesComponent extends Component {
  constructor(props) {
    super(props);
    //this.handleChange = this.handleChange.bind(this);
    this.sendInvoice = this.sendInvoice.bind(this);
    //this.rejectRequest = this.rejectRequest.bind(this);
    this.state = {
      selectedRequest: {},
      showModal: false,
      showValidationMessage: false,
      isInvoiceValidated: false,
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
    getAcmeInvoicesList().then((res) => {
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
    
    const activeItem = this.state.requests.find((item) => (item.Hash === activeItemName))
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
                  Hash: {this.state.selectedRequest.Hash}
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
              <Button color = 'green' onClick = {this.sendInvoice}>
                <Icon name = 'check'></Icon>
                  Send invoice to Blockchain
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


  sendInvoice(request) {
    this.closeModal()
    this.setState({showValidationMessage: true,
                    isInvoiceValidated: true})
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
      //                isInvoiceValidated: true})

  }
 
  /*rejectRequest(request) {
    this.closeModal()
    this.setState({showValidationMessage: true,
                    isInvoiceValidated: false})
    //TODO: reject request HOW??
  }*/

  showValidationMessage() {
    return (<SendInvoiceComponent isValidate = {this.state.isInvoiceValidated}></SendInvoiceComponent>)
  }

  render() {

    var listItems = null

    if (this.state.requests) {
      const list = this.state.requests
      console.log(this.state.requests);
      
      listItems = list.map((result) => 
        
        <List.Item style = {{minWidth: 250}} key= {result.hash}>
        {console.log(result)}
          <div id={result.Hash} onClick = {this.handleItemClick}>
            <Card
              as = 'a'
              header={result.Hash}
              id = {result.Hash}
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
              {this.state.showValidationMessage ? <SendInvoiceComponent isValidate = {this.state.isInvoiceValidated}></SendInvoiceComponent> : null}
            </div>
          </div>
          :
          <EmptyInvoices/>}
        </div>
      )
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

}

//
//
//
//
//
//
//
//
//
// Signed Invoices
//
//
//
//
//
//
//
//
//
//

class SignedInvoicesComponent extends Component {

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
        hasSelectedRequest: false
        } 
        this.getRequests = this.getRequests.bind(this)
    }
    
    componentDidMount() {
        this.getRequests()
    }
    
    getRequests() {
      getFullSignedInvoicesList().then((res) => {
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
                    <List.Header>{this.state.selectedRequest.invoiceID}</List.Header>
                </List.Item>
                <List.Item>
                    <List.Icon name='euro' />
                    <List.Content>Amount: {this.state.selectedRequest.amount}€</List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='calendar alternate outline' />
                    <List.Content>
                    Emission date: {this.state.selectedRequest.emissionDate}
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
                <List.Item>
                    <List.Icon name='key' />
                    <List.Content>
                    KKey: {this.state.selectedRequest.data.RKey}
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
                    Send invoice
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
    
}
export default Acme;