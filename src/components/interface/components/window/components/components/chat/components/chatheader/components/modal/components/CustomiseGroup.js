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

});

export default class CustomiseGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            edit: this.props.edit,
            value: (this.props.edit === 'title') ? this.props.group.title : this.props.group.description
        }
    }

    handleOnChange = (event) => {
        const value = event.target.value;

        this.setState({
            value: value
        }, () => {
            this.props.handleValid(this.isValid(value), value);
        });
    };

    isValid() {
        const value = this.state.value.trim();

        return (!validator.isEmpty(value) && value !== this.props.group[this.state.edit]);
    }

    render() {
        const editTitle = (this.state.edit === 'title');

        return (
            <div style={{...styles.row, ...styles.w100}}>
                <div style={{...styles.row, ...styles.w100}}>
                    <div style={{...styles.section, ...styles.w100}}>
                        <div style={{...styles.row, ...styles.title}}>
                            {'Change This Group\'s ' + ((editTitle) ? 'Title' : 'Description')}
                        </div>
                        <div style={{...styles.row, ...styles.content, ...styles.w100}}>
                            <TextField
                                name='title'
                                value={this.state.value}
                                floatingLabelText={(editTitle) ? 'Title' : 'Description'}
                                floatingLabelFixed={true}
                                hintText={'Type a group ' + ((editTitle) ? 'title' : 'description') + '...'}
                                fullWidth={true}
                                floatingLabelStyle={styles.textField.floatingLabelStyle}
                                onChange={(event) => this.handleOnChange(event)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}