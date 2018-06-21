import React from 'react';

import ChangeEmailAddress from './components/ChangeEmailAddress';
import ChangePassword from './components/ChangePassword';

const moment = require('moment');

const styles = ({
    column: {
        display: 'flex',
        flexDirection: 'column'
    },
    row: {
        display: 'flex',
        flexDirection: 'row'
    },
    w100: {
        width: '100%'
    },
    content: {
        justifyContent: 'space-between'
    },
    account: {
        content: {
            marginTop: '4px',
            fontSize: '15px'
        }
    },
    title: {
        fontWeight: '500',
        fontSize: '16px'
    },
    link: {
        cursor: 'pointer'
    },
    section: {
        display: 'flex',
        flexDirection: 'column'
    },
    spacing: {
        marginBottom: '14px',
    }
});

export default class Account extends React.Component {
    constructor() {
        super();

        this.state = {
            section: null
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.editing === null) {
            this.setState({
                section: null
            });
        }
    }

    handleChange = (section) => {
        this.setState({
            section: section
        }, () => {
            this.props.handleOnClick(section);
        });
    };

    render() {
        if (this.state.section === null) {
            return <Overview
                user={this.props.user}
                handleChange={this.handleChange}
            />
        }
        else if (this.state.section === 'emailAddress' || this.state.section === 'password') {
            if (this.state.section === 'emailAddress') {
                return <ChangeEmailAddress
                    user={this.props.user}
                    error={this.props.error}
                    clearError={this.props.clearError}
                    handleValid={this.props.handleValid}
                />
            }
            else {
                return <ChangePassword
                    user={this.props.user}
                    error={this.props.error}
                    clearError={this.props.clearError}
                    handleValid={this.props.handleValid}
                />
            }
        }
    }
}

class Overview extends React.Component {
    render() {
        const dateCreated = moment(Date.parse(this.props.user.creationTime)).format('dddd, MMMM Do YYYY');
        const lastSignedIn = moment(Date.parse(this.props.user.lastSignInTime)).format('dddd, MMMM Do YYYY ? HH:mm A').replace('?', 'at');

        return (
            <div style={{...styles.row, ...styles.w100, ...styles.content}}>
                <div style={styles.column}>
                    <div style={{...styles.row, ...styles.spacing}}>
                        <div style={styles.section}>
                            <div style={{...styles.row, ...styles.w100, ...styles.title}}>
                                Date Created
                            </div>
                            <div style={{...styles.row, ...styles.w100, ...styles.account.content}}>
                                {dateCreated}
                            </div>
                        </div>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.section}>
                            <div style={{...styles.row, ...styles.w100, ...styles.title}}>
                                Email Address
                            </div>
                            <div style={{...styles.row, ...styles.w100, ...styles.account.content}}>
                                {this.props.user.emailAddress}&nbsp;&mdash;&nbsp;<span style={styles.link} onClick={() =>
                                this.props.handleChange('emailAddress')}>Change</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.column}>
                    <div style={{...styles.row, ...styles.spacing}}>
                        <div style={styles.section}>
                            <div style={{...styles.row, ...styles.w100, ...styles.title}}>
                                Last Signed In
                            </div>
                            <div style={{...styles.row, ...styles.w100, ...styles.account.content}}>
                                {lastSignedIn}
                            </div>
                        </div>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.section}>
                            <div style={{...styles.row, ...styles.w100, ...styles.title}}>
                                Password
                            </div>
                            <div style={{...styles.row, ...styles.w100, ...styles.account.content}}>
                                <span style={styles.link} onClick={() =>
                                    this.props.handleChange('password')}>Change</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}