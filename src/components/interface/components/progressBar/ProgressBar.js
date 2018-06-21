import React from 'react';
import LinearProgress from 'material-ui/LinearProgress';

const styles = ({
    progressBar: {
        position: 'absolute',
        height: '2px',
        backgroundColor: 'rgb(224, 224, 224)',
        zIndex: '2'
    }
});

export default class ProgressBar extends React.Component {
    render() {
        return (
            <LinearProgress
                color='rgb(91, 134, 229)'
                style={styles.progressBar}
            />
        );
    }
}