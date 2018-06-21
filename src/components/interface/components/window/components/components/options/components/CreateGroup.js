import React from 'react';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import AddIcon from 'material-ui/svg-icons/content/add-circle';

const database = require('~/database/database');

const styles = ({
    container: {
        padding: '0 22px 0 22px',
    },
    textField: {
        width: '100%'
    },
    submit: {
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        iconButton: {
            marginRight: '-14px',
            icon: {
                color: 'rgb(91, 134, 229)'
            }
        }
    }
});

export default class CreateGroup extends React.Component {
    constructor() {
        super();

        this.state = {
            title: '',
            description: '',
            isProcessing: false
        }
    }

    handleOnChange = (event) => {
        const name = event.target.name;
        const text = event.target.value;

        this.setState({
            [name]: text
        });
    };

    handleSubmit = () => {
        this.setState({
            isProcessing: true
        }, () => {
            const groupInformation = {
                title: this.state.title.trim(),
                description: this.state.description.trim(),
                members: {
                    counter: 0
                }
            };

            database.createGroup(this.props.user, groupInformation, (response) => {
                if (!response) {
                    this.setState({
                        title: '',
                        description: '',
                        isProcessing: false
                    });

                    this.props.handleError(true);
                }
            });
        });
    };

    render() {
        return (
            <div style={styles.container}>
                <TextField
                    name='title'
                    value={this.state.title}
                    hintText='Type a group title...'
                    floatingLabelText='Title'
                    floatingLabelFixed={true}
                    fullWidth={true}
                    onChange={(event) => this.handleOnChange(event)}
                    style={styles.textField}
                />
                <TextField
                    name='description'
                    value={this.state.description}
                    hintText='Type a group description...'
                    floatingLabelText='Description'
                    floatingLabelFixed={true}
                    fullWidth={true}
                    onChange={(event) => this.handleOnChange(event)}
                    style={styles.textField}
                />
                <div style={styles.submit}>
                    <IconButton
                        disabled={(this.state.title.trim().length === 0 || this.state.title.trim().length > 44 || this.state.description.trim().length === 0 || this.state.isProcessing)}
                        style={styles.submit.iconButton}
                        iconStyle={styles.submit.iconButton.icon}
                        onClick={() => this.handleSubmit()}
                    >
                        <AddIcon/>
                    </IconButton>
                </div>
            </div>
        );
    }
}