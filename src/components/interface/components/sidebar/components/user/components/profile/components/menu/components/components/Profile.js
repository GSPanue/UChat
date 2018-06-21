import React from 'react';
import TextField from 'material-ui/TextField';
import Avatar from 'material-ui/Avatar';
import validator from 'validator';

const styles = ({
    avatar: {
        height: '110px',
        width: '110px',
        fontSize: '40px',
        background: 'rgb(91, 134, 229)'
    },
    container: {
        column: {
            display: 'flex',
            flexDirection: 'column'
        },
        row: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-evenly'

        }
    },
    textField: {
        floatingLabelStyle: {
            fontSize: '20px'
        }
    }
});

export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            firstName: {
                value: this.props.user.firstName,
                errorText: ''
            },
            lastName: {
                value: this.props.user.lastName,
                errorText: ''
            }
        }
    }

    handleOnChange = (event) => {
        const field = event.target.name;
        const value = event.target.value;

        this.setState({
            [field]: {
                ...this.state[field], value: value
            }
        }, () => {
            this.props.handleValid(this.isValid(), {
                firstName: this.state.firstName.value,
                lastName: this.state.lastName.value
            });
        });
    };

    handleOnBlur = (event) => {
        const field = event.target.name;
        const value = event.target.value.trim();

        let errorText = null;

        if (validator.isEmpty(value)) {
            errorText = 'You can\'t leave this empty.';
        }
        else if (!validator.matches(value, /^(?!.* {2})[A-Za-z .-]+$/g)) {
            errorText = 'This can only contain letters of the alphabet.';
        }

        (errorText !== null) ? this.setState({
            [field]: {
                ...this.state[field], errorText: errorText
            }
        }) : false;
    };

    handleOnFocus = (event) => {
        const field = event.target.name;

        this.setState({
            [field]: {
                ...this.state[field], errorText: ''
            }
        });
    };

    isValid() {
        const keys = ['firstName', 'lastName'];

        let hasBeenChanged = false;

        keys.forEach((key) => {
            if (this.state[key].value.trim() !== this.props.user[key]) {
                hasBeenChanged = true;
            }
        });

        let isValid = true;

        if (hasBeenChanged) {
            keys.forEach((key) => {
                if (this.state[key].value.trim() !== this.props.user[key]) {
                    if (validator.isEmpty(this.state[key].value.trim()) || this.state[key].errorText !== '') {
                        isValid = false;
                    }
                    else if (!validator.matches(this.state[key].value.trim(), /^(?!.* {2})[A-Za-z .-]+$/g)) {
                        isValid = false;
                    }
                }
            });
        }

        return (isValid && hasBeenChanged);
    };

    render() {
        return (
            <div style={styles.container.row}>
                <div style={{...styles.container.column, justifyContent: 'center'}}>
                    <Avatar style={styles.avatar}>{this.state.firstName.value.trim().toUpperCase().charAt(0)}</Avatar>
                </div>
                <div style={styles.container.column}>
                    <TextField
                        name='firstName'
                        value={this.state.firstName.value}
                        floatingLabelText='First Name'
                        hintText='First Name'
                        floatingLabelFixed={true}
                        errorText={(this.state.firstName.errorText.length > 0) ? this.state.firstName.errorText : null}
                        floatingLabelStyle={styles.textField.floatingLabelStyle}
                        onChange={(event) => this.handleOnChange(event)}
                        onBlur={(event) => this.handleOnBlur(event)}
                        onFocus={(event) => this.handleOnFocus(event)}
                    />
                    <TextField
                        name='lastName'
                        value={this.state.lastName.value}
                        floatingLabelText='Last Name'
                        hintText='Last Name'
                        floatingLabelFixed={true}
                        errorText={(this.state.lastName.errorText.length > 0) ? this.state.lastName.errorText : null}
                        floatingLabelStyle={styles.textField.floatingLabelStyle}
                        onChange={(event) => this.handleOnChange(event)}
                        onBlur={(event) => this.handleOnBlur(event)}
                        onFocus={(event) => this.handleOnFocus(event)}
                    />
                </div>
            </div>
        );
    }
}