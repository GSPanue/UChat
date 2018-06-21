import React from 'react';
import {grey800} from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MessageOptionsIcon from 'material-ui/svg-icons/navigation/more-horiz';

const styles = ({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        margin: '20px 0',
        innerDiv: {
            width: '100%'
        }
    },
    messageContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        marginRight: '38px',
        avatar: {
            height: '46px',
            width: '46px',
            marginLeft: '38px',
            marginRight: '29px',
        },
        left: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            name: {
                marginBottom: '6px',
                fontWeight: '400'
            },
            message: {
                textAlign: 'justify',
                fontWeight: '300',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                color: grey800,
                deleted: {
                    color: 'rgba(66, 66, 66, 0.54)'
                }
            }
        },
        right: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginRight: '38px',
            color: grey800,
            fontWeight: '400'
        }
    },
    options: {
        fontSize: '14px',
        lineHeight: '36px',
        minHeight: '0',
        maxHeight: '34px'
    },
    iconMenu: {
        anchorOrigin: {
            horizontal: 'left',
            vertical: 'bottom'
        },
        targetOrigin: {
            horizontal: 'left',
            vertical: 'top'
        },
    },
    iconButton: {
        width: '100%',
        height: '100%',
        padding: '0',
        icon : {
            width: '21',
            height: '21'
        }
    }
});

export default class Message extends React.Component {
    handleAvatarBackground = () => {
        return (this.props.name === 'You') ? {background: 'rgb(91, 134, 229)'} : {background: grey800};
    };

    handleNameColor = () => {
        return (this.props.name === 'You') ? {color: 'rgb(91, 134, 229)'} : {color: grey800};
    };

    handleOptions = (event, value) => {
        this.props.handleGroupOptions({
            action: value.toLowerCase(),
            uid: this.props.message.user.uid,
            mid: this.props.message.mid,
            message: this.props.message.message
        });
    };

    render() {
        const messageIsFromAdmin = this.props.message.admin;
        const messageIsFromBannedUser = this.props.banned;
        const messageIsDeleted = this.props.message.deleted;

        const isAdmin = this.props.isAdmin;
        const isClient = this.props.isClient;

        let options = [];

        if (!messageIsDeleted) {
            if (isClient) {
                options = [
                    [<MenuItem key={1}
                               value='Edit'
                               primaryText='Edit'
                               style={styles.options}
                    />],
                    [<MenuItem key={2}
                               value='Delete'
                               primaryText='Delete'
                               style={styles.options}
                    />]
                ];
            }
            else if (isAdmin && !isClient) {
                if (messageIsFromBannedUser) {
                    options = [
                        [<MenuItem key={1}
                                   value='Delete'
                                   primaryText='Delete'
                                   style={styles.options}
                        />]
                    ];
                }
                else {
                    options = [
                        [<MenuItem key={1}
                                   value='Delete'
                                   primaryText='Delete'
                                   style={styles.options}
                        />],
                        [<MenuItem key={2}
                                   value='Ban'
                                   primaryText='Ban'
                                   style={styles.options}
                        />]
                    ];
                }
            }
        }
        else if (messageIsDeleted && isAdmin && !isClient) {
            if (!messageIsFromBannedUser) {
                options = [<MenuItem key={2}
                                     value='Ban'
                                     primaryText='Ban'
                                     style={styles.options}
                />];
            }
        }

        return (
            <div style={styles.container}>
                <div style={styles.container.innerDiv}>
                    <div style={styles.messageContainer}>
                        <div><Avatar style={{...styles.messageContainer.avatar, ...this.handleAvatarBackground()}}>
                            {this.props.avatar}
                            </Avatar>
                        </div>
                        <div style={styles.messageContainer.left}>
                            <div style={{...styles.messageContainer.left.name, ...this.handleNameColor()}}>
                                {this.props.name} {(messageIsFromAdmin) && ' (Admin)'}
                            </div>
                            <div style={{...styles.messageContainer.left.message,
                                ...(messageIsDeleted) && styles.messageContainer.left.message.deleted}}>
                                {this.props.message.message}
                            </div>
                        </div>
                        <div style={styles.messageContainer.right}>
                            <div>
                                {this.props.timeStamp}
                            </div>
                                {(options.length > 0) && <div><IconMenu
                                    onChange={this.handleOptions}
                                    iconButtonElement={<IconButton
                                        iconStyle={styles.iconButton.icon}
                                        style={styles.iconButton}>
                                        <MessageOptionsIcon/>
                                    </IconButton>}
                                    anchorOrigin={styles.iconMenu.anchorOrigin}
                                    targetOrigin={styles.iconMenu.targetOrigin}
                                >
                                    {options}
                                </IconMenu></div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}