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
    this.setState({isTramitShown : !this.state.isRequestsShown})
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
                  {this.state.isTramitShown}
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




export default Creditor;
