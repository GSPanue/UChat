import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const styles = ({
    text: {
        fontSize: '18px',
        color: 'rgb(66, 66, 66)'
    },
    button: {
        cancel: {
            color: 'rgb(66, 66, 66)'
        },
        leave: {
            color: 'rgb(91, 134, 229)'
        }
    }
});

export default class Alert extends React.Component {
    render() {
        const actions = [
            <FlatButton
                label='Cancel'
                primary={true}
                onClick={() => this.props.handleAlert(false, null, null, 0)}
                labelStyle={styles.button.cancel}
            />,
            <FlatButton
                label={(this.props.type === 'leave') ? 'Leave' : 'Delete'}
                primary={true}
                onClick={() => this.props.handleAlert(false, null, null, 1)}
                labelStyle={styles.button.leave}
            />,
        ];

        return (
            <Dialog
                actions={actions}
                modal={true}
                open={this.props.open}
                autoDetectWindowHeight={true}
                bodyStyle={styles.text}
            >
                {this.props.title}
            </Dialog>
        );
    }
}