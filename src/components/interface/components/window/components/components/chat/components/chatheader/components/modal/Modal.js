import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import validator from 'validator';

import Overview from './components/Overview';
import CustomiseGroup from './components/CustomiseGroup';

const database = require('~/database/database');

const styles = ({
    body: {
        overflow: 'overlay',
        fontSize: '15px',
        color: 'rgb(66, 66, 66)'
    },
    content: {
        maxWidth: '650px'
    }
});

export default class Modal extends React.Component {
    constructor() {
        super();

        this.state = {
            edit: {
                section: null,
                updating: false,
                value: null,
                valid: false
            }
        }
    }

    handleChange = (section) => {
        if (section === null) {
            this.setState({
                edit: {
                    ...this.state.edit, section: null, updating: false, value: null, valid: false
                }
            });
        }
        else {
            this.setState({
                edit: {
                    ...this.state.edit, section: section
                }
            });
        }
    };

    handleClose = () => {
        this.props.handleModal(false);

        this.setState({
            edit: {
                ...this.state.edit, section: null, updating: false, value: null, valid: false
            }
        });
    };

    handleValid = (isValid, value) => {
        this.setState({
            edit: {
                ...this.state.edit, value: (isValid) ? value : null, valid: isValid
            }
        });
    };

    handleSubmit = () => {
        const value = this.state.edit.value.trim();
        const valid = this.state.edit.valid && !validator.isEmpty(value);

        if (valid) {
            this.setState({
                edit: {
                    ...this.state.edit, updating: true
                }
            }, () => {
                const update = {
                    key: this.state.edit.section,
                    value: value
                };

                database.updateGroup(this.props.user, this.props.group.id, update, (response) => {
                    if (response) {
                        this.handleChange(null);
                    }
                    else {
                        this.props.handleError(true);
                        this.handleClose();
                    }
                });
            });
        }
    };

    render() {
        const overviewActions = [
            <FlatButton
                label='Close'
                primary={true}
                onClick={() => this.handleClose()}
            />
        ];

        const customiseGroupActions = [
            <FlatButton
                label='Cancel'
                primary={true}
                onClick={() => this.handleChange(null)}
            />,
            <FlatButton
                label='Save'
                primary={true}
                disabled={(!this.state.edit.valid && !this.state.edit.updating) || this.state.edit.updating}
                onClick={() => this.handleSubmit()}
            />
        ];

        let actions = null;

        if (this.state.edit.section === null) {
            actions = overviewActions;
        }
        else if (this.state.edit.section !== null) {
            if (this.state.edit.updating) {
                actions = customiseGroupActions[1];
            }
            else {
                actions = customiseGroupActions;
            }
        }

        return (
            <Dialog
                actions={actions}
                modal={true}
                open={this.props.open}
                autoDetectWindowHeight={true}
                bodyStyle={styles.body}
                contentStyle={styles.content}
                autoScrollBodyContent={true}
            >
                {(this.state.edit.section === null) ? <Overview
                    group={this.props.group}
                    isAdmin={this.props.isAdmin}
                    handleChange={this.handleChange}
                    handleBan={this.props.handleBan}
                /> : <CustomiseGroup
                    group={this.props.group}
                    edit={this.state.edit.section}
                    handleValid={this.handleValid}
                />}
            </Dialog>
        );
    }
}