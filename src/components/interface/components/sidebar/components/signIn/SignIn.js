import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';

import Form from './components/Form';

const database = require('~/database/database');

const styles = ({
    heading: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10%',
        text: {
            fontSize: '22px'
        },
        logo: {
            height: '32px',
            marginRight: '8px'
        }
    },
    subHeading: {
        fontSize: '38px',
        marginBottom: '8%'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '5%'
    },
    submit: {
        container: {
            display: 'flex',
            flexDirection: 'row-reverse',
            button: {
                background: {
                    color: 'rgb(91, 134, 229)'
                },
                hoverColor: {
                    color: 'rgb(66, 66, 66)'
                },
                width: '30%',
                color: '#ffffff',
                height: '43px',
                lineHeight: '40px',
                label: {
                    fontSize: '0.975rem',
                    circularProgress: {
                        verticalAlign: 'middle',
                        marginTop: '-1px',
                        color: {
                            color: '#ffffff'
                        }

                    }
                }
            }
        }
    },
    divider: {
        container: {
            color: 'rgb(167, 167, 167)',
            fontWeight: 'inherit',
            letterSpacing: '.1em',
            lineHeight: '0px',
            textAlign: 'center',
            margin: '7% 0 12% 0',
            span: {
                fontSize: '0.975rem',
                backgroundColor: '#FFF',
                padding: '10px 0.8em',
                border: '1px solid rgb(224, 224, 224)',
                borderRadius: '50%',
                boxShadow: '0 0 10px 0 rgba(0,0,0,.15)'
            }
        },
    },
    back: {
        marginTop: '6%',
        link: {
            fontWeight: '500',
            cursor: 'pointer'
        }
    }
});

export default class SignIn extends React.Component {
    constructor() {
        super();

        this.state = {
            panel: 0,
            signIn: {
                emailAddress: '',
                password: ''
            },
            signUp: {
                firstName: '',
                lastName: '',
                emailAddress: '',
                password: ''
            },
            progressBar: false,
            submitted: false
        }
    }

    handlePanelChange = (panel) => {
        const defaultSignIn = {emailAddress: '', password: ''};
        const defaultSignUp = Object.assign({}, defaultSignIn, {firstName: '', lastName: ''});

        this.setState({
            panel: panel,
            signIn: defaultSignIn,
            signUp: defaultSignUp
        });

        this.refs.panel.clearState();
    };

    handleInput = (event, isInvalid) => {
        const textField = event.target.name;
        const value = (textField === 'password') ? event.target.value : event.target.value.trim();
        const panel = (this.state.panel === 0) ? 'signIn' : 'signUp';

        this.setState({
            [panel]: {
                ...this.state[panel], [textField]: (isInvalid) ? '' : value
            }
        });
    };

    handleSubmit = () => {
        const panelFields = ((this.state.panel === 0) ? this.state.signIn : this.state.signUp);

        let flag = true;

        Object.keys(panelFields).map((i) => {
            (panelFields[i].length === 0) ? flag = false : false;
        });

        if (flag) {
            this.props.progressBar();

            if (this.state.panel === 0) {
                const user = {emailAddress: this.state.signIn.emailAddress, password: this.state.signIn.password};

                database.signIn(user, (response) => {
                    if (!response.success) {
                        this.props.progressBar();
                        this.refs.panel.handleFailedSignIn();
                    }
                });
            }
            else if (this.state.panel === 1) {
                this.props.progressBar();

                database.addUser(panelFields, (response) => {
                    this.props.progressBar();

                    if (response.success) {
                        this.handlePanelChange(0);
                    }
                    else if (!response.success) {
                        if (response.error === 'auth/email-already-in-use') {
                            this.refs.panel.handleEmailInUse();
                        }
                    }
                });
            }
        }
        else {
            const textFields = this.state[(this.state.panel === 0) ? 'signIn' : 'signUp'];
            let emptyTextFields = {};

            Object.keys(textFields).map((i) => {
                (textFields[i].length === 0) ? emptyTextFields[i] = textFields[i] : false;
            });

            this.refs.panel.handleFieldIsEmpty(emptyTextFields);
        }
    };

    render() {
        const panel = this.state.panel;
        const subHeading = (panel === 0) ? 'Sign In' : 'Sign Up';

        const signUpButton = (panel === 0) ?
            (<div>
                <div style={styles.divider.container}>
                    <Divider/>
                    <span style={styles.divider.container.span}>or</span>
                </div>
                <FlatButton
                    label='Sign Up'
                    backgroundColor={styles.submit.container.button.background.color}
                    hoverColor={styles.submit.container.button.hoverColor.color}
                    fullWidth={true}
                    style={styles.submit.container.button}
                    labelStyle={styles.submit.container.button.label}
                    onClick={() => this.handlePanelChange(1)}
                />
            </div>) : <div style={styles.back}>Already have a UChat account?
                <span style={styles.back.link} onClick={() => this.handlePanelChange(0)}>&nbsp;Sign In</span>
            </div>;

        return (
            <div>
                <div style={styles.heading}>
                    <img style={styles.heading.logo} src='./img/logo.png'></img>
                    <span style={styles.heading.text}>UChat</span>
                </div>
                <div style={styles.subHeading}>
                    {subHeading}
                </div>
                <div style={styles.form}>
                    <Form ref='panel' panel={panel} handleInput={this.handleInput} handleSubmit={this.handleSubmit}/>
                </div>
                <div style={styles.submit.container}>
                    <FlatButton
                        label='Submit'
                        backgroundColor={styles.submit.container.button.background.color}
                        hoverColor={styles.submit.container.button.hoverColor.color}
                        style={styles.submit.container.button}
                        labelStyle={styles.submit.container.button.label}
                        onClick={() => this.handleSubmit()}
                    />
                </div>
                {signUpButton}
            </div>
        );
    }
}

