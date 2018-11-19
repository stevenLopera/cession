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
  Form
} from 'semantic-ui-react'  
import 'semantic-ui-css/semantic.min.css';
import {
  DateInput
} from 'semantic-ui-calendar-react';

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

  render() {
    const { activeItem } = this.state

    return (
      <Menu pointing secondary vertical inverted>
        <Menu.Item
          name='tramitaciones'
          active={  activeItem === 'tramitaciones'}
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='pagos'
          active={activeItem === 'pagos'}
          onClick={this.handleItemClick}
        />
      </Menu>
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
      activeItem: '', 
      showModal: false
    };
    //TODO: Confirm the fields needed
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  results = [{
    name: 'Pepe'
  },
  {
    name: 'Maria'
  },
  {
    name: 'Juanito'
  }]

  handleItemClick = (event) => {
    // Only way found to detect the element clicked
    const activeItem = event.target.parentNode.parentNode.id
    
    console.log(activeItem)
    this.setState({
      activeItem: activeItem,
      showModal: true
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

  handleSubmit(event) {
    console.log(this.state)
  }
  showModal() {

    const activeItem = this.results.find((item) => item.name === this.state.activeItem)
    console.log(this.results);

    if(activeItem) {
      return (
        <Modal
         open = {this.state.showModal}
           onClose = {() => this.setState({showModal: false})}
        >
          <Modal.Header>Tramites para {activeItem.name}</Modal.Header>
          <Modal.Content>
            <Form>
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
                <label>Invoice number</label>
                <input placeholder='Invoice number'
                  name = 'invoiceNumber'
                  type = 'number'
                  value = {this.state.invoiceNumber}
                  onChange = {this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <label>Key R</label>
                <input placeholder='37fh4j58k3j' 
                  name = 'keyR'
                  type = 'text'
                  value = {this.state.keyR}
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
              <Button className='primary' type='submit' onClick = {this.handleSubmit}>Send</Button>
            </Form>
          </Modal.Content>
        </Modal>
      )
    }
  }
  onModalClose() {
    this.setState({
      showModal: false
    })
  }
  render() {
    const results = [{
      name: 'Pepe'
    },
    {
      name: 'Maria'
    },
    {
      name: 'Juanito'
    }]

    const listItems = results.map((result) => 
      <List.Item key= {result.name}>
        <div id={result.name} onClick = {this.handleItemClick}>
          <Card
            as = 'a'
            header={result.name}
            id = {result.name}
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
      </div>
    )
  }
}


class InvoiceSearch extends Component{

  constructor(props) {
    super(props);
    this.state = {KeyR: '',
                  DirAcme: '',
                  hasResults: false};

    this.handleChange = this.handleChange.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
      hasResults: false
    })
  }

  render() {
    return (
      <Container>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Key R</label>
            <input placeholder='8c8182d1823ds123' 
              name = 'KeyR'
              value = {this.state.invoiceKey}
              type = 'text'
              onChange = {this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Acme Direction</label>
            <input placeholder='@Acme' 
              name = 'DirAcme'
              value = {this.state.DirAcme}
              type = 'text'
              onChange = {this.handleChange2}
            />
          </Form.Field>
          <Button className='primary' type='submit'>Search Payment</Button>
        </Form>,
        <Container style = {{
          marginTop: 20,
          textAlign: 'center'
        }}>
          {this.state.hasResults ? <FindPayments results={[]}/> : null}
        </Container>
      </Container>
    )
  }
}


class FindPayments extends Component {

  /*
  Buscar el pago con esa clave y a esa direccion
  */ 
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