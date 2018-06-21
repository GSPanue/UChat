import React from 'react';
import TextField from 'material-ui/TextField';
import validator from 'validator';

const styles = ({
    form: {
        field: {
            borderColor: {
                borderColor: 'rgb(91, 134, 229)',
            },
            color: {
                color: 'rgb(91, 134, 229)'
            },
            fontSize: {
                fontSize: '24px'
            },
            spacing: {
                marginBottom: '1.5%'
            }
        },
        inlineContainer: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            spacing: {
                width: '45%',
                marginBottom: '1.5%'
            }
        },
        rowContainer: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%'
        }
    },
    invalidSignIn: {
        position: 'relative',
        bottom: '-13px',
        fontSize: '12px',
        lineHeight: '12px',
        textAlign: 'center',
        color: 'rgb(244, 67, 54)',
        transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
    }
});

export default class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            emailAddress: {
                value: '',
                errorText: ''
            },
            password: {
                value: '',
                errorText: ''
            },
            firstName: {
                value: '',
                errorText: ''
            },
            lastName: {
                value: '',
                errorText: ''
            },
            panel: this.props.panel
        }
    };

    clearState = () => {
        this.setState({
            emailAddress: {
                value: '',
                errorText: ''
            },
            password: {
                value: '',
                errorText: ''
            },
            firstName: {
                value: '',
                errorText: ''
            },
            lastName: {
                value: '',
                errorText: ''
            },
            signInFailed: false
        });
    };

    handleOnChange = (event) => {
        const textField = event.target.name, value = event.target.value;

        this.setState({
            [textField]: {
                ...this.state[textField], value: value
            }
        });
    };

    handleOnBlur = (event) => {
        const isSignUp = (this.props.panel === 1);
        const textField = event.target.name;
        const value = (textField === 'password') ? event.target.value : event.target.value.trim();

        let errorText = null;

        if (isSignUp) {
            if (validator.isEmpty(value)) {
                errorText = 'You can\'t leave this empty.';
            }
            else if (['firstName', 'lastName'].indexOf(textField) > -1) {
                if (!validator.matches(value, /^(?!.* {2})[A-Za-z .-]+$/g)) {
                    errorText = 'This can only contain letters of the alphabet.'
                }
            }
            else if (textField === 'emailAddress' && !validator.isEmail(value)) {
                errorText = 'This email address format is not recognised.';
            }
            else if (textField === 'password' && !validator.matches(value, /^(?=.*\d).{6,}$/)) {
                errorText = 'Your password must be six characters long and contain at least one number.';
            }
        }

        (errorText === null) ? this.props.handleInput(event, false) : this.props.handleInput(event, true);

        this.setState({
            [textField]: {
                ...this.state[textField], errorText: ((errorText === null) ? '' : errorText)
            }
        }, () => {
            (this.state.submitted) ? this.props.handleSubmit(): null;

            this.setState({
                submitted: false
            });
        });
    };

    handleOnFocus = (event) => {
        const textField = event.target.name, isInvalid = this.state[textField].errorText !== '';
        const signInFailed = this.state.signInFailed;

        if (signInFailed) {
            this.setState({
                signInFailed: false,
                emailAddress: {
                    ...this.state.emailAddress, errorText: ''
                },
                password: {
                    ...this.state.password, value: '', errorText: ''
                }
            });
        }
        else {
            (isInvalid) ? this.setState({
                [textField]: {
                    ...this.state[textField], errorText: '',
                }
            }) : false;
        }
    };

    handleFieldIsEmpty = (emptyTextFields) => {
        Object.keys(emptyTextFields).map((i) => {
            if (this.state[i].errorText === '') {
                this.setState({
                    [i]: {
                        ...this.state[i], errorText: 'You can\'t leave this empty.'
                    }
                });
            }
        });
    };

    handleFailedSignIn = () => {
        this.setState({
            emailAddress: {
                ...this.state.emailAddress, errorText: ' '
            },
            password: {
                ...this.state.password, errorText: ' '
            },
            signInFailed: true
        });

        this.props.handleInput({target: {name: 'password', value: ''}}, true);
    };

    handleEmailInUse = () => {
        this.setState({
            emailAddress: {
                ...this.state.emailAddress, errorText: 'This email address is already in use.'
            }
        });

        this.props.handleInput({target: {name: 'emailAddress', value: ''}}, true);
    };

    handleEnterKey = (event) => {
        event.persist();

        this.setState({
            submitted: true
        }, () => {
            event.target.blur();
        });
    };

    render() {
        const signInForm = [
            <div key={1} style={styles.form.rowContainer}>
                <TextField
                    name='emailAddress'
                    value={this.state.emailAddress.value}
                    onKeyUp={(event) => (event.key === 'Enter') ? this.handleEnterKey(event) : null}
                    onChange={(event) => this.handleOnChange(event)}
                    onFocus={(event) => this.handleOnFocus(event)}
                    onBlur={(event) => this.handleOnBlur(event)}
                    errorText={(this.state.emailAddress.errorText !== '') ? this.state.emailAddress.errorText : ''}
                    floatingLabelText='Email Address'
                    hintText='example@example.com'
                    floatingLabelFixed={true}
                    fullWidth={true}
                    underlineFocusStyle={styles.form.field.borderColor}
                    floatingLabelFocusStyle={(this.state.emailAddress.errorText !== '') ? null : styles.form.field.color}
                    floatingLabelStyle={styles.form.field.fontSize}
                    style={styles.form.field.spacing}
                />
            </div>,
            <div key={2} style={styles.form.rowContainer}>
                <TextField
                    name='password'
                    value={this.state.password.value}
                    onKeyUp={(event) => (event.key === 'Enter') ? this.handleEnterKey(event) : null}
                    onChange={(event) => this.handleOnChange(event)}
                    onFocus={(event) => this.handleOnFocus(event)}
                    onBlur={(event) => this.handleOnBlur(event)}
                    errorText={(this.state.password.errorText !== '') ? this.state.password.errorText : ''}
                    floatingLabelText='Password'
                    hintText='Password'
                    type='password'
                    floatingLabelFixed={true}
                    fullWidth={true}
                    underlineFocusStyle={styles.form.field.borderColor}
                    floatingLabelFocusStyle={(this.state.password.errorText !== '') ? null : styles.form.field.color}
                    floatingLabelStyle={styles.form.field.fontSize}
                />
            </div>
        ];

        const signUpForm = [
            <div key={1} style={styles.form.inlineContainer}>
                <TextField
                    name='firstName'
                    value={this.state.firstName.value}
                    onKeyUp={(event) => (event.key === 'Enter') ? this.handleEnterKey(event) : null}
                    onChange={(event) => this.handleOnChange(event)}
                    onFocus={(event) => this.handleOnFocus(event)}
                    onBlur={(event) => this.handleOnBlur(event)}
                    errorText={(this.state.firstName.errorText !== '') ? this.state.firstName.errorText : ''}
                    floatingLabelText='First Name'
                    hintText='First Name'
                    floatingLabelFixed={true}
                    underlineFocusStyle={styles.form.field.borderColor}
                    floatingLabelFocusStyle={(this.state.firstName.errorText !== '') ? null : styles.form.field.color}
                    floatingLabelStyle={styles.form.field.fontSize}
                    style={styles.form.inlineContainer.spacing}
                />
                <TextField
                    name='lastName'
                    value={this.state.lastName.value}
                    onKeyUp={(event) => (event.key === 'Enter') ? this.handleEnterKey(event) : null}
                    onChange={(event) => this.handleOnChange(event)}
                    onFocus={(event) => this.handleOnFocus(event)}
                    onBlur={(event) => this.handleOnBlur(event)}
                    errorText={(this.state.lastName.errorText !== '') ? this.state.lastName.errorText : ''}
                    floatingLabelText='Last Name'
                    hintText='Last Name'
                    floatingLabelFixed={true}
                    underlineFocusStyle={styles.form.field.borderColor}
                    floatingLabelFocusStyle={(this.state.lastName.errorText !== '') ? null : styles.form.field.color}
                    floatingLabelStyle={styles.form.field.fontSize}
                    style={styles.form.inlineContainer.spacing}
                />
            </div>,
            <div style={styles.form.rowContainer} key={2}>
                <TextField
                    name='emailAddress'
                    value={this.state.emailAddress.value}
                    onKeyUp={(event) => (event.key === 'Enter') ? this.handleEnterKey(event) : null}
                    onChange={(event) => this.handleOnChange(event)}
                    onFocus={(event) => this.handleOnFocus(event)}
                    onBlur={(event) => this.handleOnBlur(event)}
                    errorText={(this.state.emailAddress.errorText !== '') ? this.state.emailAddress.errorText : ''}
                    floatingLabelText='Email Address'
                    hintText='example@example.com'
                    floatingLabelFixed={true}
                    fullWidth={true}
                    underlineFocusStyle={styles.form.field.borderColor}
                    floatingLabelFocusStyle={(this.state.emailAddress.errorText !== '') ? null : styles.form.field.color}
                    floatingLabelStyle={styles.form.field.fontSize}
                    style={styles.form.field.spacing}
                />
            </div>,
            <div style={styles.form.rowContainer} key={3}>
                <TextField
                    name='password'
                    value={this.state.password.value}
                    onKeyUp={(event) => (event.key === 'Enter') ? this.handleEnterKey(event) : null}
                    onChange={(event) => this.handleOnChange(event)}
                    onFocus={(event) => this.handleOnFocus(event)}
                    onBlur={(event) => this.handleOnBlur(event)}
                    errorText={(this.state.password.errorText !== '') ? this.state.password.errorText : ''}
                    floatingLabelText='Password'
                    hintText='Password'
                    type='password'
                    floatingLabelFixed={true}
                    fullWidth={true}
                    underlineFocusStyle={styles.form.field.borderColor}
                    floatingLabelFocusStyle={(this.state.password.errorText !== '') ? null : styles.form.field.color}
                    floatingLabelStyle={styles.form.field.fontSize}
                />
            </div>,
        ];

        const signInFailed = <div style={styles.invalidSignIn}>The email address or password you entered is incorrect.</div>;

        return (
            <div>
                {(this.props.panel === 0) ? signInForm : signUpForm}
                {this.state.signInFailed ? signInFailed : null}
            </div>
        );
    }
}