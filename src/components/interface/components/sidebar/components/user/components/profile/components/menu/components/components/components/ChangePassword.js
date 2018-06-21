import React from 'react';
import TextField from 'material-ui/TextField';
import validator from 'validator';

const styles = ({
    row: {
        display: 'flex',
        flexDirection: 'row'
    },
    w100: {
        width: '100%'
    },
    content: {
        marginTop: '4px',
        fontSize: '15px'
    },
    textField: {
        floatingLabelStyle: {
            fontSize: '20px'
        }
    },
    title: {
        fontWeight: '500',
        fontSize: '16px'
    },
    section: {
        display: 'flex',
        flexDirection: 'column'
    },
    invalidPassword: {
        position: 'relative',
        bottom: '-13px',
        fontSize: '12px',
        lineHeight: '12px',
        textAlign: 'center',
        color: 'rgb(244, 67, 54)',
        transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
    }
});

export default class ChangeEmailAddress extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.user,
            currentPassword: {
                value: '',
                errorText: ''
            },
            password: {
                value: '',
                errorText: ''
            },
            error: null
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.error !== this.state.error) {
            this.setState({
                currentPassword: {
                    ...this.state.currentPassword, errorText: (nextProps.error ==='auth/wrong-password') ? ' ' : ''
                },
                error: nextProps.error
            });
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
                currentPassword: this.state.currentPassword.value,
                password: this.state.password.value
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
        else if (field === 'password' && !validator.matches(value, /^(?=.*\d).{6,}$/)) {
            errorText = 'Your password must be six characters long and contain at least one number.';
        }

        (errorText !== null) ? this.setState({
            [field]: {
                ...this.state[field], errorText: errorText
            }
        }) : false;
    };

    handleOnFocus = (event) => {
        const field = event.target.name;

        (this.state.error) ? this.props.clearError() : false;

        this.setState({
            [field]: {
                ...this.state[field], errorText: ''
            }
        });
    };

    isValid() {
        const keys = ['currentPassword', 'password'];

        let hasEnteredPasswords = (this.state.currentPassword.value.trim().length > 0 &&
            this.state.password.value.trim().length > 0);

        let isValid = true;

        if (hasEnteredPasswords) {
            keys.forEach((key) => {
                if (this.state[key].errorText !== '') {
                    isValid = false;
                }
                else if (key === 'password' && !validator.matches(this.state[key].value, /^(?=.*\d).{6,}$/)) {
                    isValid = false;
                }
            });
        }

        return hasEnteredPasswords && isValid;
    }

    render() {
        const invalidPassword = <div style={styles.invalidPassword}>The password you entered is incorrect.</div>;

        return (
            <div style={{...styles.row, ...styles.w100}}>
                <div style={{...styles.row, ...styles.w100}}>
                    <div style={{...styles.section, ...styles.w100}}>
                        <div style={{...styles.row, ...styles.title}}>
                            Change Your Password
                        </div>
                        <div style={{...styles.row, ...styles.content, ...styles.w100}}>
                            <TextField
                                name='currentPassword'
                                value={this.state.currentPassword.value}
                                type='password'
                                floatingLabelText='Current Password'
                                hintText='Current Password'
                                floatingLabelFixed={true}
                                fullWidth={true}
                                errorText={(this.state.currentPassword.errorText.length > 0) ? this.state.currentPassword.errorText : null}
                                floatingLabelStyle={styles.textField.floatingLabelStyle}
                                onChange={(event) => this.handleOnChange(event)}
                                onBlur={(event) => this.handleOnBlur(event)}
                                onFocus={(event) => this.handleOnFocus(event)}
                            />
                        </div>
                        <div style={{...styles.row, ...styles.content, ...styles.w100}}>
                            <TextField
                                name='password'
                                value={this.state.password.value}
                                type='password'
                                floatingLabelText='Password'
                                hintText='Password'
                                fullWidth={true}
                                floatingLabelFixed={true}
                                errorText={(this.state.password.errorText.length > 0) ? this.state.password.errorText : null}
                                floatingLabelStyle={styles.textField.floatingLabelStyle}
                                onChange={(event) => this.handleOnChange(event)}
                                onBlur={(event) => this.handleOnBlur(event)}
                                onFocus={(event) => this.handleOnFocus(event)}
                            />
                        </div>
                        {(this.state.error === 'auth/wrong-password') ? invalidPassword : null}
                    </div>
                </div>
            </div>
        );
    }
}