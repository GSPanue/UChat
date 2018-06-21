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
            emailAddress: {
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
            let key = null;

            if (nextProps.error === 'auth/wrong-password') {
                key = 'password'
            }
            else if (nextProps.error === 'auth/email-already-in-use') {
                key = 'emailAddress'
            }

            this.setState({
                [key]: {
                    ...this.state[key], errorText: (nextProps.error) ? ' ' : ''
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
                emailAddress: this.state.emailAddress.value,
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
        else if (field === 'emailAddress' && !validator.isEmail(value)) {
            errorText = 'This email address format is not recognised.';
        }

        (errorText !== null) ? this.setState({
            [field]: {
                ...this.state[field], errorText: errorText
            }
        }) : false;
    };

    handleOnFocus = (event) => {
        const field = event.target.name;

        (this.state.error !== null) ? this.props.clearError() : false;

        this.setState({
            [field]: {
                ...this.state[field], errorText: ''
            }
        });
    };

    isValid() {
        const keys = ['emailAddress', 'password'];

        let hasBeenChanged = (this.state.emailAddress.value.trim() !== this.props.user.emailAddress);
        let hasEnteredPassword = (this.state.password.value.trim().length > 0);

        let isValid = true;

        if (hasBeenChanged && hasEnteredPassword) {
            keys.forEach((key) => {
                if (this.state[key].errorText !== '') {
                    isValid = false;
                }
                else if (key === 'emailAddress' && !validator.isEmail(this.state[key].value.trim())) {
                    isValid = false;
                }
            });
        }

        return hasBeenChanged && hasEnteredPassword && isValid;
    }

    render() {
        const invalidPassword = <div style={styles.invalidPassword}>The password you entered is incorrect.</div>;
        const emailAlreadyInUse = <div style={styles.invalidPassword}>The email address you entered is already in use.</div>;

        let errorAlert = null;

        if (this.state.error !== null) {
            if (this.state.error === 'auth/wrong-password') {
                errorAlert = invalidPassword;
            }
            else if (this.state.error === 'auth/email-already-in-use') {
                errorAlert = emailAlreadyInUse;
            }
        }

        return (
            <div style={{...styles.row, ...styles.w100}}>
                <div style={{...styles.row, ...styles.w100}}>
                    <div style={{...styles.section, ...styles.w100}}>
                        <div style={{...styles.row, ...styles.title}}>
                            Change Your Email Address
                        </div>
                        <div style={{...styles.row, ...styles.content, ...styles.w100}}>
                            <TextField
                                name='emailAddress'
                                value={this.state.emailAddress.value}
                                floatingLabelText='Email Address'
                                hintText='example@example.com'
                                floatingLabelFixed={true}
                                fullWidth={true}
                                errorText={(this.state.emailAddress.errorText.length > 0) ? this.state.emailAddress.errorText : null}
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
                                floatingLabelText='Current Password'
                                hintText='Current Password'
                                fullWidth={true}
                                floatingLabelFixed={true}
                                errorText={(this.state.password.errorText.length > 0) ? this.state.password.errorText : null}
                                floatingLabelStyle={styles.textField.floatingLabelStyle}
                                onChange={(event) => this.handleOnChange(event)}
                                onBlur={(event) => this.handleOnBlur(event)}
                                onFocus={(event) => this.handleOnFocus(event)}
                            />
                        </div>
                        {errorAlert}
                    </div>
                </div>
            </div>
        );
    }
}