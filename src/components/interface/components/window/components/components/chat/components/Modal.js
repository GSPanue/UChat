import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

const styles = ({
    overlay: {
        backgroundColor: 'initial'
    },
    modal: {
        maxWidth: '620px',
        body: {
            overflowY: 'auto'
        }
    },
    button: {
        cancel: {
            color: 'rgb(66, 66, 66)'
        }
    },
    title: {
        fontSize: '20px'
    },
    textField: {
        marginTop: '-13px'
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        color: 'rgb(66, 66, 66)',
        left: {
            marginRight: '5px'
        },
        right: {
            marginLeft: '5px'
        }
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%'
    },
    content: {
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        heading: {
            fontWeight: '500'
        }
    },
    spacing: {
        marginBottom: '8px'
    },
    alignment: {
        alignItems: 'center'
    }
});

export default class Modal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            message: this.props.message,
            editedMessage: this.props.message
        }
    }

    handleOnChange = (event) => {
        const value = event.target.value;

        this.setState({
            editedMessage: value
        });
    };

    render() {
        const actions = [
            (!this.props.isSaving) &&
            <FlatButton
                label='Cancel'
                primary={true}
                onClick={() => this.props.handleCancel()}
                labelStyle={styles.button.cancel}
            />,
            <FlatButton
                label='Save Changes'
                primary={true}
                disabled={(this.props.isSaving || this.state.message === this.state.editedMessage || this.state.editedMessage.trim().length === 0)}
                onClick={() => this.props.handleSubmit(this.state.editedMessage.trim())}
            />
        ];

        return(
            <Dialog
                actions={actions}
                modal={false}
                open={this.props.open}
                autoDetectWindowHeight={true}
                contentStyle={styles.modal}
                title='Edit your message'
                titleStyle={styles.title}
                onRequestClose={() => this.props.handleCancel()}
                overlayStyle={styles.overlay}
                bodyStyle={styles.modal.body}
            >
                <div style={styles.row}>
                    <div style={{...styles.column, ...styles.column.left}}>
                        <div style={{...styles.row, ...styles.spacing, ...styles.alignment, ...styles.content.heading}}>
                            Your original message:
                        </div>
                        <div style={{...styles.row, ...styles.content}}>
                            {this.state.message}
                        </div>
                    </div>
                    <div style={{...styles.column, ...styles.column.right}}>
                        <div style={{...styles.row, ...styles.spacing, ...styles.alignment, ...styles.content.heading}}>
                            Your edited message:
                        </div>
                        <div style={{...styles.row, ...styles.content}}>
                            <TextField
                                value={this.state.editedMessage}
                                hintText='Type a message...'
                                multiLine={true}
                                underlineShow={true}
                                fullWidth={true}
                                style={styles.textField}
                                rows={1}
                                rowsMax={8}
                                onChange={(event) => this.handleOnChange(event)}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        )
    }
}