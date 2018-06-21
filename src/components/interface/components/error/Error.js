import React from 'react';
import Snackbar from 'material-ui/Snackbar';

export default class Error extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            message: 'Oops... Something went wrong. Try refreshing the page.',
            open: this.props.error,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            open: nextProps.error
        });
    }

    handleActionClick = () => {
        window.location.reload();
    };

    handleRequestClose = () => {
        this.props.handleError(false);
    };

    render() {
        return (
            <div>
                <Snackbar
                    open={this.state.open}
                    message={this.state.message}
                    action='Refresh'
                    onActionTouchTap={this.handleActionClick}
                />
            </div>
        );
    }
}