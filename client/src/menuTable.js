import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import Settings from 'material-ui/svg-icons/action/settings';
import ContentFilter from 'material-ui/svg-icons/content/filter-list';
import FileFileDownload from 'material-ui/svg-icons/file/file-download';
import Toggle from 'material-ui/Toggle';
import Renew from 'material-ui/svg-icons/action/autorenew';
import Snackbar from '@material-ui/core/Snackbar';

import Slider from 'rc-slider';
import './css/rc-slider.css';

import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';

import SaveIcon from './icons/save-icon';
import BallotIcon from './icons/ballot-recount';
import RenewIcon from './icons/renew-icon';
import SettingsIcon from './icons/settings';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import { connect } from 'react-redux';
import isEmpty from 'lodash.isempty';

import { dateAddAction } from './actions/dateAddAction';
/**
 * Three controlled examples, the first allowing a single selection, the second multiple selections,
 * the third using internal state.
 */
const wrapperStyle = { width: '90%', margin: 10 };
const wrapperStyle1 = { width: 150, margin: 0 };

const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '90%',
        align: 'center',
        backgroundColor: theme.palette.background.paper,
    },
    smallIcon: {
        width: 30,
        height: 30,
    },
    mediumIcon: {
        width: 48,
        height: 48,
    },
    largeIcon: {
        width: 60,
        height: 60,
    },
    small: {
        width: 30,
        height: 30,
        padding: 1,
    },
    medium: {
        width: 96,
        height: 96,
        padding: 24,
    },
    large: {
        width: 120,
        height: 120,
        padding: 30,
    },
    propContainer: {
        width: '80%',
        overflow: 'hidden',
        margin: '20px auto 0',
    },
    propToggleHeader: {
        margin: '20px auto 10px',
    },
    menuContainer: {
        width: '95%',
        overflow: 'hidden',
        margin: '20px auto 0',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: '0',
        marginRight: '0',
        width: ' 200px '
    },
    rc_slider_mark:
    {
        top: '12px'
    }
});




class MenuTable extends Component {

    constructor(props) {
        let isNll = false;
        super(props);

        const { fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes,
            height,
            isStation,
            isLoading,
            snack_msg,
            dateTimeBegin,
            dateTimeEnd,
            isSensor,
            defaultPageSize,
            hideFiltartion,
            isEdit,
            isForceToggle
        } = props;

        if (isStation) { isNll = true }
        // if (!isSensor) { isSensor = false }

        this.state = {
            fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            isEdit: isEdit,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes,
            height,
            isStation: isNll,
            isLoading,
            snack_msg,
            dateTimeBegin,
            dateTimeEnd,
            isSensor,
            defaultPageSize,
            hideFiltartion,
            averaging: 1

        };



        this.handleChangeMultiple = this.handleChangeMultiple.bind(this);
        this.handleChangeSingle = this.handleChangeSingle.bind(this);
        this.handleOnRequestChange = this.handleOnRequestChange.bind(this);
        this.handleOpenMenu = this.handleOpenMenu.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleUpdateSQLClick = this.handleUpdateSQLClick.bind(this);

    }

    handleUpdateSQLClick() {
        this.props.handleUpdateData();

    };

    handleChangeSingle(event, value) {
        this.setState({
            valueSingle: value,
        });
    };

    handleChangeMultiple(event, value) {
        this.setState({
            valueMultiple: value,
        });
    };

    handleOpenMenu() {
        this.setState({
            openMenu: true,
        });
    }

    handleOnRequestChange(value) {
        this.setState({
            openMenu: value,
        });
    }
    handleTableUpdate(stateValue) {
        this.setState({
            nameFilter: stateValue
        })
    }
    handleToggle(event, toggled) {
        this.setState({
            [event.target.name]: toggled
        });
        this.props.handleToggle(event, toggled);

        if ((event.target.name === 'selectable') ||
            (event.target.name === 'multiSelectable') ||
            (event.target.name === 'enableSelectAll')) {

            if (!this.state.showCheckboxes) {
                event.target.name = 'showCheckboxes'
                this.props.handleToggle(event, toggled);
                this.setState({
                    showCheckboxes: toggled
                });
            }
        }
    };

    handleChange(name, event) {
        this.setState({ [name]: event.target.value });
        this.props.handleChange(name, event.target.value);

    };
    handleRefresh = name => event => {
        // let { state } = this;
        this.props.handleClick();
    };

    handlePickerChange = (event) => {
        const value = event.target.value;
        const id = event.target.id;

        dateAddAction({ [id]: value });
    };

    handleEdit(event, toggled) {

        var _res = this.props.handleToggleEdit(event, toggled);
        if (!_res)
            this.setState({
                [event.target.name]: toggled
            });
    };



    render() {
        let { username } = '';

        const { classes } = this.props;

        if (!isEmpty(sessionStorage.jwToken)) {
            let { auth } = this.props;
            username = auth[0].user.username;
        } else {
            isAuthenticated = false;
            username = '';
        }
        /*let { fixedHeader,
            fixedFooter,
            stripedRows,
            showRowHover,
            selectable,
            multiSelectable,
            enableSelectAll,
            deselectOnClickaway,
            showCheckboxes,
            height
        } = this.props;*/
        return (
            //<Paper className={classes.root}>

            <nav className="navbar form-control classes.container">
                <div className="navbar-header"   >
                    <IconButton
                        className={classes.button}
                        tooltip={'Обновить'}
                        onClick={this.handleRefresh('all')} //fake parameter for return function call
                    >
                        <Icon className={classes.icon} color="primary">
                            <RenewIcon />
                        </Icon>
                    </IconButton>
                    {(this.state.isEdit) && (!this.props.isForceToggle) &&
                        <IconButton className={classes.button} tooltip={'Записать'} aria-label="Записать">
                            <Icon className={classes.icon} color="primary" onClick={this.handleUpdateSQLClick}>
                                < SaveIcon />
                            </Icon>
                        </IconButton>
                    }

                    &nbsp;&nbsp;&nbsp;
                    {(this.state.isSensor) && '  данные с:    '}
                    {(this.state.isSensor) && <TextField
                        id="dateTimeBegin"
                        label="начало периода"
                        type="datetime-local"
                        defaultValue={this.props.dateTimeBegin}
                        className={classes.textField}
                        // selectProps={this.state.dateTimeBegin}
                        onChange={(event) => { this.handlePickerChange(event) }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />}
                    &nbsp;&nbsp;&nbsp;
                    {(this.state.isSensor) && '  по:     '}
                    {(this.state.isSensor) && <TextField
                        id="dateTimeEnd"
                        label="конец периода"
                        type="datetime-local"
                        defaultValue={this.props.dateTimeEnd}
                        className={classes.textField}
                        // SelectProps ={this.state.dateTimeEnd}
                        onChange={(event) => { this.handlePickerChange(event) }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    }
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {(this.state.isSensor) && ' усреднение, мин.:'}


                </div>

                <div style={wrapperStyle1}>
                    {(this.state.isSensor) && <br />}


                    {(this.state.isSensor) &&
                        <Slider min={1} max={20} defaultValue={1} marks={{ 1: '1', 5: '5', 10: '10', 20: '20' }} step={null} 
                        onChange={(value1) => this.handleChange(name = 'averaging',  { target: {value: value1}})}

                        />
                    }
                </div>
                <div className="navbar-right">

                    <IconMenu
                        iconButtonElement={<IconButton
                            className={classes.button}
                            tooltip={'Настройки таблиц'}>
                            <Icon
                                className={classes.icon}>
                                <SettingsIcon />
                            </Icon>
                        </IconButton>}
                        onChange={this.handleChangeSingle}
                        value={this.state.valueSingle}>

                        <div className="form-control " style={styles.menuContainer}>
                            {(username == 'admin') && (typeof (this.props.handleToggleEdit) === 'function') && <Toggle
                                name="isEdit"
                                label="Редактировать данные"
                                onToggle={this.handleEdit}
                                defaultToggled={(!this.props.isForceToggle) ? this.state.isEdit : false}
                            />}
                            <Toggle
                                name="stripedRows"
                                label="Черно-белый стиль"
                                onToggle={this.handleToggle}
                                defaultToggled={this.state.stripedRows}
                            />
                        </div>
                        <div className="form-control " style={styles.menuContainer}>
                            <div style={styles.propContainer} >

                                <h6>Настройка таблицы</h6>

                                <TextField
                                    label="Высота окна таблицы"
                                    defaultValue={this.state.height}
                                    onChange={(event) => this.handleChange(name = 'height', event)}
                                /><br />
                                <TextField
                                    label="Записей на странице таблицы"
                                    defaultValue={this.state.defaultPageSize}
                                    onChange={(event) => this.handleChange(name = 'defaultPageSize', event)}
                                />

                            </div>
                        </div>


                    </IconMenu>

                </div>
                <Snackbar
                    open={this.props.isLoading}
                    // TransitionComponent={<Slider direction="up" />}
                    autoHideDuration={4000}
                    onClose={this.props.handleClose}

                    message={<span id="message-id">{this.props.snack_msg}</span>}

                />
            </nav>
            //</Paper>
        );
    }
}

function mapStateToProps(state) {
    return {
        /*  fixedHeader: state.fixedHeader,
          fixedFooter: state.fixedFooter,
          stripedRows: state.stripedRows,
          showRowHover: state.showRowHover,
          selectable: state.selectable,
          multiSelectable: state.multiSelectable,
          enableSelectAll: state.enableSelectAll,
          deselectOnClickaway: state.deselectOnClickaway,
          showCheckboxes: state.showCheckboxes,
          height: state.height*/

        //isEdit: state.isEdit

    };
}

MenuTable.propTypes = {

    classes: PropTypes.object.isRequired,
    handleClick: PropTypes.func.isRequired
}

export default connect(null, { dateAddAction })(withStyles(styles)(MenuTable));