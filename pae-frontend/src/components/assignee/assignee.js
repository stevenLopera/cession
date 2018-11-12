import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {
  Button,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  List,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
  GridColumn,
  GridRow,
  Form
} from 'semantic-ui-react'  

import {
  DateInput
} from 'semantic-ui-calendar-react';

class Assignee extends Component {
  render() {
    return <div>Assignee</div>;
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
  state = { activeItem: 'tramitar' }

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
          name='tramitar'
          active={  activeItem === 'tramitar'}
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='consultar'
          active={activeItem === 'consultar'}
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
                  emissionDate: '',
                  expirationDate: ''
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
    console.log(this.state)
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
            iconPosition = 'left'
          />
        </Form.Field>
        <Form.Field>
          <label>Expiration date</label>
          <input placeholder='MM/DD/AAAA'
            name = 'expirationDate'
            type = 'date'
            value = {this.state.expirationDate}
            onChange = {this.handleChange}
            iconPosition = 'left'
          />
        </Form.Field>
        <Button className='primary' type='submit' onClick = {this.handleSubmit}>Upload invoice</Button>
      </Form>
    );
  }
}


class InvoiceSearch extends Component{

  constructor(props) {
    super(props);
    this.state = {invoiceKey: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({invoiceKey: event.target.value});
  }

  handleSubmit(event) {
    alert('A key was submitted: ' + this.state.value);
    event.preventDefault();
    //TODO: Query the smart contract
    // add a loading spinner, hide the form and show result?
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Field>
          <label>Invoice key</label>
          <input placeholder='8c8182d1823ds123' 
            name = 'invoiceKey'
            value = {this.state.invoiceKey}
            type = 'text'
            onChange = {this.handleChange}
          />
        </Form.Field>
        <Button className='primary' type='submit'>Search invoice</Button>
      </Form>
    );
  }
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

const HomepageLayout = () => (
  <ResponsiveContainer>
    
  </ResponsiveContainer>
)

export default HomepageLayout