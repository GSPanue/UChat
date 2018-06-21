import React from 'react';
import {CardHeader} from 'material-ui/Card';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Avatar from 'material-ui/Avatar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import LinkIcon from 'material-ui/svg-icons/content/link';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import InformationIcon from 'material-ui/svg-icons/action/info';
import LeaveIcon from 'material-ui/svg-icons/action/exit-to-app';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import Divider from 'material-ui/Divider';
import {grey800} from 'material-ui/styles/colors';

import Alert from './components/Alert';
import Modal from './components/modal/Modal';

const database = require('~/database/database');
const debounce = require('lodash.debounce');

const styles = ({
    container: {
        borderBottom: '1px solid rgb(224, 224, 224)',
        chatHeaderContainer: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '16px 0',
            left: {
                width: '70%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginLeft: '22px'
            },
            right: {
                width: '30%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                marginRight: '22px'
            }
        }
    },
    cardHeader: {
        title: {
            fontSize: '24px',
            fontWeight: '400',
            color: grey800
        },
        subtitle: {
            fontSize: '16px',
            fontWeight: '300'
        }
    },
    avatar: {
        height: '60px',
        width: '60px',
        fontSize: '30px',
        background: 'rgb(91, 134, 229)'
    },
    iconMenu: {
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
    },
    hyperlink: {
        display: 'flex',
        alignItems: 'center',
        iconStyle: {
            color: 'rgb(91, 134, 229)',
            height: '20',
            width: '20'
        },
        buttonStyle: {
            marginLeft: '3px',
            height: '1',
            width: '1',
            padding: '80'
        }
    }
});

export default class ChatHeader extends React.Component {
    constructor() {
        super();

        this.state = {
            alert: {
                open: false,
                title: null,
                type: null
            },
            modal: {
                open: false
            }
        }
    }

    handleAlert = (open, title, type, action) => {
        if (action !== null) {
            if (action === 1) {
                (this.state.alert.type === 'leave') ? this.props.handleLeaveGroup() : this.props.handleDeleteGroup();
            }

            this.setState({
                alert: {
                    ...this.state.alert, open: false, title: null, type: null
                }
            });
        }
        else {
            this.setState({
                alert: {
                    ...this.state.alert, open: open, title: title, type: type
                }
            });
        }
    };

    handleModal = (open) => {
        this.setState({
            modal: {
                ...this.state.modal, open: open
            }
        });
    };

    handleBan = (member, action) => {
        if (action === 'ban') {
            database.banUser(this.props.user, this.props.group.id, member, (response) => {
                if (!response) {
                    this.props.handleError(true);
                }
            });
        }
        else if (action === 'unban') {
            database.unbanUser(this.props.user, this.props.group.id, member, (response) => {
                if (!response) {
                    this.props.handleError(true);
                }
            });
        }
    };

    render() {
        const group = this.props.group;

        const title = (
            <div style={styles.hyperlink}>
                {group.title}
                <CopyToClipboard text={window.location.href + 'join/' + group.id}>
                    <IconButton
                        iconStyle={styles.hyperlink.iconStyle}
                        style={styles.hyperlink.buttonStyle}
                        tooltip='Copy group link to clipboard'
                        tooltipPosition='bottom-center'
                    >
                        <LinkIcon/>
                    </IconButton>
                </CopyToClipboard>
            </div>
        );

        return (
            <div style={styles.container}>
                <Alert
                    handleAlert={this.handleAlert}
                    open={this.state.alert.open}
                    title={this.state.alert.title}
                    type={this.state.alert.type}
                />
                <Modal
                    open={this.state.modal.open}
                    user={this.props.user}
                    group={group}
                    isAdmin={this.props.isAdmin}
                    handleModal={this.handleModal}
                    handleBan={this.handleBan}
                    handleError={this.props.handleError}
                />
                <div style={styles.container.chatHeaderContainer}>
                    <div style={styles.container.chatHeaderContainer.left}>
                        <CardHeader
                            title={title}
                            subtitle={group.members.counter + ((group.members.counter === 1) ? ' member' : ' members')}
                            avatar={<Avatar style={styles.avatar}>{group.title.charAt(0).toUpperCase()}</Avatar>}
                            titleStyle={styles.cardHeader.title}
                            subtitleStyle={styles.cardHeader.subtitle}
                        />
                    </div>
                    <div style={styles.container.chatHeaderContainer.right}>
                        <IconMenu iconButtonElement={<IconButton><MoreVertIcon/></IconButton>}
                                  iconStyle={styles.iconMenu.icon}
                                  anchorOrigin={styles.iconMenu.anchorOrigin}
                                  targetOrigin={styles.iconMenu.targetOrigin}
                        >
                            <MenuItem
                                primaryText='Group Information'
                                leftIcon={<InformationIcon/>}
                                onClick={debounce(() =>
                                    this.handleModal(true), 350)
                                }
                            />
                            <Divider/>
                            <MenuItem
                                primaryText='Leave Group'
                                leftIcon={<LeaveIcon/>}
                                onClick={debounce(() =>
                                    this.handleAlert(true, ('Are you sure you want to leave ' + group.title + '?'), 'leave', null), 350)
                                }
                            />
                            {(this.props.isAdmin) && <MenuItem
                                primaryText='Delete Group'
                                leftIcon={<DeleteIcon/>}
                                onClick={debounce(() =>
                                    this.handleAlert(true, ('Are you sure you want to delete ' + group.title + '?'), 'delete', null), 350)
                                }
                            />}
                        </IconMenu>
                    </div>
                </div>
            </div>
        );
    }
}