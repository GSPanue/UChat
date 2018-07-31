import React from 'react';
import Snackbar from 'material-ui/Snackbar';

export default class Error extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: this.props.error
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

    render() {
        return (
            <div>
                <Snackbar
                    open={this.state.open}
                    message='Oops... Something went wrong. Try refreshing the page.'
                    action='Refresh'
                    onActionTouchTap={this.handleActionClick}
                />
            </div>
        );
    }
}