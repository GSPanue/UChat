import React from 'react';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import AccountCircleIcon from 'material-ui/svg-icons/action/account-circle';
import ArrowDropRightIcon from 'material-ui/svg-icons/navigation-arrow-drop-right';
import InputIcon from 'material-ui/svg-icons/action/input';
import BuildIcon from 'material-ui/svg-icons/action/build';

import Modal from './components/Modal';

const debounce = require('lodash.debounce');

const styles = ({
    menu: {
        marginLeft: '20px',
        anchorOrigin: {
            horizontal: 'left',
            vertical: 'top'
        },
        targetOrigin: {
            horizontal: 'left',
            vertical: 'top'
        },
        icon: {
            color: 'rgb(91, 134, 229)'
        }
    }
});

export default class Menu extends React.Component {
    constructor() {
        super();

        this.state = {
            modal: {
                open: false,
                type: null
            }
        }
    }

    handleModal = (boolean, type) => {
        this.setState({
            modal: {
                ...this.state.modal, open: boolean, type: type
            }
        });
    };

    render() {
        return (
            <div>
                <Modal
                    open={this.state.modal.open}
                    type={this.state.modal.type}
                    user={this.props.user}
                    handleModal={this.handleModal}
                    handleError={this.props.handleError}
                />
                <IconMenu
                    iconButtonElement={<IconButton iconStyle={styles.menu.icon}><MoreVertIcon/></IconButton>}
                    anchorOrigin={styles.menu.anchorOrigin}
                    targetOrigin={styles.menu.targetOrigin}
                    style={styles.menu}
                >
                    <MenuItem
                        primaryText='My Profile'
                        leftIcon={<AccountCircleIcon/>}
                        onClick={debounce(() => this.handleModal(true, 'profile'), 350)}
                    />
                    <MenuItem
                        primaryText='Settings'
                        leftIcon={<BuildIcon/>}
                        rightIcon={<ArrowDropRightIcon/>}
                        menuItems={[
                            <MenuItem primaryText='Account'
                                      onClick={debounce(() => this.handleModal(true, 'account'), 350)}
                            />
                        ]}
                    />
                    <Divider/>
                    <MenuItem primaryText={'Sign Out'}
                              leftIcon={<InputIcon/>}
                              onClick={this.props.signOut}
                    />
                </IconMenu>
            </div>
        );
    }
}