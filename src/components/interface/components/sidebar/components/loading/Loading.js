import React from 'react';

const styles = ({
    heading: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: '5%',
        text: {
            fontSize: '38px'
        },
        logo: {
            height: '48px',
            marginRight: '8px'
        }
    },
    subHeading: {
        textAlign: 'center',
        text: {
            fontSize: '18px'
        }
    }
});

export default class Loading extends React.Component {
    render() {
        return (
            <div>
                <div style={styles.heading}>
                    <img style={styles.heading.logo} src={'./img/logo.png'}></img>
                    <span style={styles.heading.text}>UChat</span>
                </div>
                <div style={styles.subHeading}>
                    <span style={styles.subHeading.text}>{this.props.subHeading}</span>
                </div>
            </div>
        )
    }
}