import React from 'react';
import IconButton from 'material-ui/IconButton';
import SendIcon from 'material-ui/svg-icons/content/send';
import {Card} from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import {grey800} from 'material-ui/styles/colors';
import TypingIcon from 'material-ui/svg-icons/content/create';

const debounce = require('lodash.debounce');

const styles = ({
    container: {
        width: '100%',
        height: '100%',
        chatBarContainer: {
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            bar: {
                margin: '0 0 0 38px',
                width: '100%'
            },
            submit: {
                margin: '0 22px'
            }
        }
    },
    divider: {
        margin: '-1px 0 0 0',
        height: '1px',
        border: 'none',
        backgroundColor: 'rgb(224, 224, 224)'
    },
    card: {
        margin: '20px 0px 12px 0px',
        width: '100%'
    },
    textField: {
        padding: '0px 20px 0px 20px',
        width: '100%'
    },
    button: {
        height: '60px',
        width: '60px',
        padding: '0',
        icon: {
            height: '40px',
            width: '40px',
            color: 'rgb(91, 134, 229)'
        }
    },
    typingIndicator: {
        padding: '0px 0px 12px 38px',
        fontSize: '15px',
        fontWeight: '300',
        color: grey800,
        container: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        icon: {
            height: '18px',
            width: '17px',
            color: 'rgb(91, 134, 229)'
        }
    }
});

export default class ChatBar extends React.Component {
    constructor() {
        super();

        this.state = {
            message: '',
            typing: false
        };

        this.handleOnKeyUp = this.handleOnKeyUp.bind(this);
        this.handleOnKeyUp = debounce(this.handleOnKeyUp, 1200);
    }

    componentWillUnmount() {
        this.handleOnKeyUp.cancel();

        (this.state.typing) && this.props.handleTyping(this.props.group.id, false);
    }

    componentWillReceiveProps(nextProps) {
        const currentGroup = this.props.group;

        if (currentGroup.id !== nextProps.group.id) {
            this.setState({
                message: '',
                typing: false
            }, () => {
                this.props.handleTyping(currentGroup.id, false);
            });
        }
    }

    handleOnChange = (event) => {
        const text = event.target.value;

        this.setState({
            message: text
        });
    };

    handleSubmit = () => {
        const id = this.props.group.id;
        const message = this.state.message.trim();

        if (message.length > 0) {
            const user = {
                uid: this.props.user.uid,
                firstName: this.props.user.firstName,
                lastName: this.props.user.lastName,
                fullName: this.props.user.fullName
            };

            this.setState({
                message: '',
                typing: false
            }, () => {
                this.props.handleSendMessage(id, user, message);
                this.props.handleTyping(this.props.group.id, false);
            });
        }
    };

    handleOnKeyDown = () => {
        const isTyping = this.state.typing;

        (!isTyping) && this.setState({
            typing: true
        }, () => {
            this.props.handleTyping(this.props.group.id, true);
        });
    };

    handleOnKeyUp = () => {
        const isTyping = this.state.typing;

        (isTyping) && this.setState({
            typing: false
        }, () => {
            this.props.handleTyping(this.props.group.id, false);
        });
    };

    render() {
        let typingText = '\u00A0';

        if (this.props.typing.length === 1) {
            typingText += this.props.typing[0] + ' is typing a message...';
        }
        else if (this.props.typing.length === 2) {
            typingText += this.props.typing[0] + ' and ' + this.props.typing[1] + ' are typing a message...';
        }
        else if (this.props.typing.length > 2) {
            typingText += this.props.typing[0] + ', ' + this.props.typing[1] + ' and ' + (this.props.typing.length - 2) + ' others are typing a message...';
        }

        return (
            <div style={styles.container}>
                <hr style={styles.divider}/>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={styles.container.chatBarContainer}>
                    <div style={styles.container.chatBarContainer.bar}>
                        <Card style={styles.card}>
                            <TextField
                                value={this.state.message}
                                hintText='Type a message...'
                                underlineShow={false}
                                multiLine={true}
                                rows={1}
                                rowsMax={4}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        this.handleSubmit();
                                        event.preventDefault();
                                    }
                                    else {
                                        this.handleOnKeyDown();
                                    }
                                }}
                                onKeyUp={() => this.handleOnKeyUp()}
                                onChange={(event) => this.handleOnChange(event)}
                                style={styles.textField}
                            />
                        </Card>
                    </div>
                    <div style={styles.container.chatBarContainer.submit}>
                        <IconButton
                            disabled={(this.state.message.trim() === '')}
                            onClick={() => this.handleSubmit()}
                            iconStyle={styles.button.icon}
                            style={styles.button}
                        >
                            <SendIcon/>
                        </IconButton>
                    </div>
                </div>
                    <div style={styles.typingIndicator}>
                        <div style={styles.typingIndicator.container}>
                            {(this.props.typing.length > 0) ? [[<TypingIcon key={0} style={styles.typingIndicator.icon}/>], typingText] : '\u00A0'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}