import React, { Component } from 'react';

import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';

import MenuPoints from './menuPoints';

import FontIcon from 'material-ui/FontIcon';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
import SensorsIcon from 'material-ui/svg-icons/action/settings-input-component';
import StationsIcon from 'material-ui/svg-icons/action/account-balance';
import DataIcon from 'material-ui/svg-icons/action/timeline';
import IconButton from '@material-ui/core/IconButton';
import Renew from 'material-ui/svg-icons/action/autorenew';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';
import Switch from '@material-ui/core/Switch';
import SvgIcon from '@material-ui/core/SvgIcon';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';

import Typography from '@material-ui/core/Typography';

import uuid from 'uuid/v1';

import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import toUpper from 'lodash/toUpper';
import isNumber from 'lodash.isnumber';

import L from 'leaflet';
import { LeafIcon } from 'leaflet';
import './map-widget.css';
import 'leaflet/dist/leaflet.css';
import markerPin from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { getStationsList } from './actions/stationsGetAction';
import { queryEvent, queryOperativeEvent } from './actions/queryActions';
import { getPoint, updatePoint, deletePoint, insertPoint, updatePointAll, changePoint, measureActivate, measureStop, getActivePoint } from './actions/adminActions';
import { pointAddAction, pointDeleteAction } from './actions/dataAddActions';
import { deleteActiveStationsList } from './actions/stationsAddAction';

import pinAlert from './pin-alert.png';
import pinGreen from './pin-green.png';


import ReactTable from "react-table";
import { useExpanded } from "react-table";

import checkboxHOC from "react-table/lib/hoc/selectTable";
const CheckboxTable = checkboxHOC(ReactTable);
import FoldableTableHOC from '../foldableTable/index';

const FoldableTable = FoldableTableHOC(CheckboxTable);

import PointDialog from './stuff/PointDialog';
import { TableRowColumn } from 'material-ui';
import { timeAddAction, timeDeleteAction } from './actions/dateAddAction';



const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    map: {
        height: '400px'
    },

    alert_macs1_ylw: {
        backgroundColor: '#ffff1a'
    },
    alert_macs5_orng: {
        backgroundColor: '#ff4d00'
    },

    alert_macs10_red: {
        backgroundColor: '#ff0000'
    },
    alert_success: {
        color: '#000000',
        backgroundColor: '#ffffff'
    },
    pin1: {
        color: '#000000',
    },

    // .rt-expander:after{content:'';position:absolute;width:0;height:0;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-90deg);border-left:5.04px solid transparent;border-right:5.04px solid transparent;border-top:7px solid rgba(0,0,0,0.8);transition:all .3s cubic-bezier(.175,.885,.32,1.275);cursor:pointer}.ReactTable 
    // .rt-expander.-open:after{transform:translate(-50%,-50%) rotate(0)}.ReactTable
    // .rt-expander{display:inline-block;position:relative;margin:0;color:transparent;margin:0 10px;}.ReactTable


});

const outer = [[50.505, -29.09], [52.505, 29.09]]
const inner = [[49.505, -2.09], [53.505, 2.09]]



function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
};



class PointsForm extends React.Component {
    constructor(props) {
        super(props);
        const {

            chartData,
            stationsList,
            sensorsList,
            auth
        } = props;

        let today = new Date();
        today -= 1200000;//20 min in milliseconds

        this.state = {
            snack_msg: '',
            errors: {},
            bounds: outer,
            stationsList,
            selection: [],
            selectAll: false,
            dateTimeBegin: new Date(today).format('Y-MM-ddTHH:mm'),
            dateTimeEnd: new Date().format('Y-MM-ddTHH:mm'),
            _map: {},
            _markers: [],
            openDialog: false,
            lat: 0,
            lon: 0,
            idd: '',
            isLoading: false,
            inMeasure: false,
            iddMeasure: '',
            points_list: [],
            points_old_list: [],
            point_actual: '',
            place: '',
            descr: '',
            auth: auth,
            fixedHeader: true,
            fixedFooter: true,
            stripedRows: false,
            showRowHover: false,
            selectable: true,
            multiSelectable: false,
            enableSelectAll: false,
            deselectOnClickaway: false,
            showCheckboxes: true,
            height: '700px',
            defaultPageSize: 10,
            isForceToggle: false,
            expanded: {},
            title: [

                {
                    Header: "ID точки",
                    id: "idd",
                    accessor: "idd",
                    filterable: true,
                    disableExpander: false,
                },
                {
                    Header: "Адрес",
                    id: "place",
                    accessor: "place",
                    Cell: null,
                    filterable: true

                },

                {
                    Header: "Описание",
                    id: "descr",
                    accessor: "descr",
                    Cell: null,
                    filterable: true

                },
                {
                    Header: "Время создания",
                    id: "date_time_begin",
                    accessor: (row) => {
                        if (!isEmpty(row.original)) {

                            let hour_from = String(row.date_time_begin).split(' ');
                            let date_from = hour_from[0].split('-');

                            let _hour_from = hour_from[1].split(':');

                            let date_time_begin = new Date(date_from[2], date_from[1] - 1, date_from[0], _hour_from[0], _hour_from[1], _hour_from[2]);
                            return new Date(date_time_begin).format('Y-MM-dd HH:mm:SS');
                        }
                        else return null;
                    },
                    Cell: (row) => {
                        return row.original.date_time_begin
                    },

                    filterAll: true,
                    filterable: true,

                },
                {
                    Header: "Время завершения",
                    id: "date_time_end",
                    accessor: (row) => {
                        if (!isEmpty(row.original)) {
                            let hour_to = String(row.date_time_end).split(' ');
                            let date_to = hour_to[0].split('-');

                            let _hour_to = hour_to[1].split(':');

                            let date_time_end = new Date(date_to[2], date_to[1] - 1, date_to[0], _hour_to[0], _hour_to[1], _hour_to[2]);
                            return new Date(date_time_end).format('Y-MM-dd HH:mm:SS');
                        } return null
                    },
                    Cell: (row) => {
                        return row.original.date_time_end
                    },
                    filterAll: true,
                    filterable: true

                },


                {
                    Header: "Широта",
                    id: "lat",
                    accessor: "lat",
                    Cell: null,
                    filterable: true

                },
                {
                    Header: "Долгота",
                    id: "lon",
                    accessor: "lon",
                    Cell: null,
                    filterable: true

                }


            ]
        };

        this.renderEditable = this.renderEditable.bind(this);
        // this.handleTableCellClick = this.handleTableCellClick.bind(this);
        //this.onExpandedChange = this.onExpandedChange.bind(this);

    }

    static defaultProps = {
        displayTitle: true,
        displayLegend: true,
        legendPosition: 'right',
        locations: ''
    };
    handleClose() {
        this.setState({ isLoading: false });
        this.setState({ isUpdated: false });

    };

    handleClick() {

        //e.preventDefault();

        this.loadData(1).then(data => {
            if (data) {
                this.loadData(3);
                // this.setState({ sensorsList: this.setData(data) })
                this.setState({ isLoading: true });
                this.setState({ snack_msg: 'Данные успешно загружены...' });
                this.setState({ isUpdated: true });

            }
            else {
                this.setState({ isLoading: false })
                this.setState({ snack_msg: 'Данные отсутствуют...' })

            }
        });

    };


    toggleSelection(key, shift, row) {
        /*
          Implementation of how to manage the selection state is up to the developer.
          This implementation uses an array stored in the component state.
          Other implementations could use object keys, a Javascript Set, or Redux... etc.
        */
        // start off with the existing state
        // let selection = this.state.selection;

        // const keyIndex = selection.indexOf(key);
        // check to see if the key exists
        // if (keyIndex >= 0) {
        // it does exist so we will remove it using destructing
        //    selection = [
        //       ...selection.slice(0, keyIndex),
        //       ...selection.slice(keyIndex + 1)
        //  ];
        //  if (row.id == this.state.api_actual) {
        //       this.setState({ api_actual: '' });
        //  };

        // } else {
        // it does not exist so add it
        //ONLY ON ROW MAY BE SELECTED
        // selection = key;
        this.setState({ point_actual: row.idd });

        //}
        // update the state
        this.setState({ selection: key });
    };

    toggleAll() {
        /*
          'toggleAll' is a tricky concept with any filterable table
          do you just select ALL the records that are in your data?
          OR
          do you only select ALL the records that are in the current filtered data?
          
          The latter makes more sense because 'selection' is a visual thing for the user.
          This is especially true if you are going to implement a set of external functions
          that act on the selected information (you would not want to DELETE the wrong thing!).
          
          So, to that end, access to the internals of ReactTable are required to get what is
          currently visible in the table (either on the current page or any other page).
          
          The HOC provides a method call 'getWrappedInstance' to get a ref to the wrapped
          ReactTable and then get the internal state and the 'sortedData'. 
          That can then be iterrated to get all the currently visible records and set
          the selection state.
        */
        const selectAll = this.state.selectAll ? false : true;
        const selection = [];
        if (selectAll) {
            // we need to get at the internals of ReactTable
            const wrappedInstance = this.checkboxTable.getWrappedInstance();
            // the 'sortedData' property contains the currently accessible records based on the filter and sort
            const currentRecords = wrappedInstance.getResolvedState().sortedData;
            // we just push all the IDs onto the selection array
            currentRecords.forEach(item => {
                selection.push(item._original._id);
            });
        }
        this.setState({ selectAll, selection });
    };

    isSelected(key) {
        /*
          Instead of passing our external selection state we provide an 'isSelected'
          callback and detect the selection state ourselves. This allows any implementation
          for selection (either an array, object keys, or even a Javascript Set object).
        */
        return this.state.selection.includes(key);
    };

    //// end of table fuctions

    handleToggle(event, toggled) {
        this.setState({
            [event.target.name]: toggled
        });
    };


    handleSnackClose() {
        this.setState({ isLoading: false });

    };


    onClickInner = () => {
        this.setState({ bounds: inner })
    }

    onClickOuter = () => {
        this.setState({ bounds: outer })
    }


    handleChange(name, value) {
        if (isNumber(parseInt(value))) { var val = parseInt(value) } else { var val = value };

        this.setState({ [name]: val });
    };


    onClickReset = () => {
        this.setState({ viewport: DEFAULT_VIEWPORT })
    }

    onViewportChanged = (viewport) => {
        this.setState({ viewport })
    }


    map_load() {
        var inMeasure = false;
        var iddMeasure = '';
        this.props.getPoint().then(data => {

            if (data.length > 0) {
                data.forEach((item, index) => {
                    const { _map } = this.state;

                    let arr_dt = item.date_time_end.split(' ');
                    let arr_d = arr_dt[0].split('-');
                    let arr_t = arr_dt[1].split(':');


                    let date_time_end = new Date(arr_d[2], arr_d[1] - 1, arr_d[0], arr_t[0], arr_t[1], arr_t[2]).getTime();

                    arr_dt = item.date_time_begin.split(' ');
                    arr_d = arr_dt[0].split('-');
                    arr_t = arr_dt[1].split(':');

                    let date_time_begin = new Date(arr_d[2], arr_d[1] - 1, arr_d[0], arr_t[0], arr_t[1], arr_t[2]).getTime();

                    if ((date_time_end < date_time_begin) || (item.in_measure)) {
                        inMeasure = true;
                        iddMeasure = item.idd;
                        item.date_time_end = "";
                        //pointDeleteAction();
                        //pointAddAction({ iddMeasure: iddMeasure, inMeasure: inMeasure, place: item.place, descr: item.descr });

                    } else {

                    }

                })

                this.setState({ inMeasure: inMeasure, points_list: data });

            }
        }).then(out => {
            this.props.getActivePoint().then(_data => {
                if ((_data.length > 0)) {
                    pointDeleteAction();
                    pointAddAction({
                        iddMeasure: _data[0].idd, inMeasure: inMeasure, place: _data[0].place, descr: !isEmpty(_data[0].descr) ? _data[0].descr : '', begin_measure_time: _data[0].date_time_in,
                        lat: _data[0].latitude, lon: _data[0].longitude
                    });
                    this.setState({ iddMeasure: _data[0].idd, lat: _data[0].latitude, lon: _data[0].longitude, point_actual: _data[0].idd })
                }
            })
        })

    }




    openMeasure(params) {
        if (!this.state.inMeasure) {
            this.setState({ openDialog: true, lat: params.lat, lon: params.lng });
        } else {
            //alert("alert")
            if (confirm('Предыдущие измерения не завршены! Завершить?')) {
                this.setState({ openDialog: true, lat: params.lat, lon: params.lng });

            }

        }
    }


    closeMeasure(params) {
        var isReal = confirm('Завершить, уверены?');
        if (isReal) {
            if (!isEmpty(this.state.iddMeasure))
                this.props.updatePoint({ idd: this.state.iddMeasure, date_time_end: '' }).then(res => {
                    this.setState({ inMeasure: false, iddMeasure: '', _markers: [] })
                    this.map_load();
                    this.setState({ snack_msg: 'Измерения по текущей точке завершены...' });
                    this.setState({ isLoading: true });
                });

        }
    }

    handleUpdateData() {
        if (!isEmpty(this.state.points_list)) {
            this.props.updatePointAll(this.state.points_list).then(res => {

                console.log("resp = ", res);
                if (res.status == 200) {

                    this.setState({ isLoading: true });
                    this.setState({ snack_msg: 'Данные успешно обновлены...' });
                    this.setState({ isEdit: false });
                    this.setState({ isForceToggle: true });
                    this.handleToggleEdit({ target: { name: 'isEdit' } }, false, true); //generation syntetic event
                    this.map_load();

                } else {
                    this.setState({ isLoading: true });
                    this.setState({ snack_msg: 'Ошибка! Данные не обновлены...' });
                    this.setState({ isEdit: false });
                    this.setState({ isForceToggle: true });
                    this.handleToggleEdit({ target: { name: 'isEdit' } }, false, true);
                    this.map_load();

                }
            })
        }
    }


    renderEditable(cellInfo) {

        function _html_out(_obj) {
            if (isEmpty(_obj.state.points_list)) {
                try {
                    //   var _tmp = Date.parse(_obj.props.points_list[0]["date_time_begin"]);
                    // if (!isNaN(_tmp))
                    return { __html: _obj.props.points_list[cellInfo.index][cellInfo.column.id] }
                    //   else
                    //       return { __html: _obj.props.points_list[cellInfo.index + 1][cellInfo.column.id] }

                }
                catch (err) {
                    return { __html: _obj.props.points_list[cellInfo.index + 1][cellInfo.column.id] }
                }

            } else {
                try {
                    // var _tmp = Date.parse(_obj.state.points_list[0]["date_time_begin"]);
                    // if (!isNaN(_tmp))
                    return { __html: _obj.state.points_list[cellInfo.index][cellInfo.column.id] }
                    //else
                    //    return { __html: _obj.state.points_list[cellInfo.index + 1][cellInfo.column.id] }

                }
                catch (err) {
                    return { __html: _obj.state.dataLipoints_listst[cellInfo.index + 1][cellInfo.column.id] }
                }

            }
        };
        return (
            <div
                style={{ backgroundColor: "#f5f5f5" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    {

                        var data;
                        if (isEmpty(this.state.points_list)) {
                            data = [...this.props.points_list];

                        } else {
                            data = [...this.state.points_list];
                        }

                        try {
                            // var _tmp = Date.parse(data[0]["date_time_begin"]);
                            // if (!isNaN(_tmp))
                            data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                            // else
                            //     data[cellInfo.index + 1][cellInfo.column.id] = e.target.innerHTML;

                        }
                        catch (err) {
                            data[cellInfo.index + 1][cellInfo.column.id] = e.target.innerHTML;
                        }

                        this.setState({ points_list: data });

                    }
                }}


                dangerouslySetInnerHTML={
                    _html_out(this)
                }


            />
        );
    } I

    renderEditable(cellInfo) {

        function _html_out(_obj) {
            if (isEmpty(_obj.state.points_list)) {
                try {
                    //   var _tmp = Date.parse(_obj.props.points_list[0]["date_time_begin"]);
                    // if (!isNaN(_tmp))
                    return { __html: _obj.props.points_list[cellInfo.index][cellInfo.column.id] }
                    //   else
                    //       return { __html: _obj.props.points_list[cellInfo.index + 1][cellInfo.column.id] }

                }
                catch (err) {
                    return { __html: _obj.props.points_list[cellInfo.index + 1][cellInfo.column.id] }
                }

            } else {
                try {
                    // var _tmp = Date.parse(_obj.state.points_list[0]["date_time_begin"]);
                    // if (!isNaN(_tmp))
                    return { __html: _obj.state.points_list[cellInfo.index][cellInfo.column.id] }
                    //else
                    //    return { __html: _obj.state.points_list[cellInfo.index + 1][cellInfo.column.id] }

                }
                catch (err) {
                    return { __html: _obj.state.dataLipoints_listst[cellInfo.index + 1][cellInfo.column.id] }
                }

            }
        };
        return (
            <div
                style={{ backgroundColor: "#f5f5f5" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    {

                        var data;
                        if (isEmpty(this.state.points_list)) {
                            data = [...this.props.points_list];

                        } else {
                            data = [...this.state.points_list];
                        }

                        try {
                            // var _tmp = Date.parse(data[0]["date_time_begin"]);
                            // if (!isNaN(_tmp))
                            data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                            // else
                            //     data[cellInfo.index + 1][cellInfo.column.id] = e.target.innerHTML;

                        }
                        catch (err) {
                            data[cellInfo.index + 1][cellInfo.column.id] = e.target.innerHTML;
                        }

                        this.setState({ points_list: data });

                    }
                }}


                dangerouslySetInnerHTML={
                    _html_out(this)
                }


            />
        );
    } I


    handleToggleEdit(event, toggled, isForceToggle) {
        const { title, points_list, points_old_list } = this.state;
        var _title = [];


        if (toggled) {
            this.setState({ isForceToggle: false });
            this.setState({
                [event.target.name]: toggled
            });
            //_props = this.props.title;

            title.map(item => {
                if (item.Cell === null) {
                    item.Cell = this.renderEditable;
                }
                _title.push(item);

            });

            this.setState({ title: title });


        }
        else {
            if (isForceToggle) {
                // Done it after SQL update!
                this.setState({
                    [event.target.name]: toggled
                });
                //_props = this.state.title;

                title.map(item => {
                    if (item.Cell === this.renderEditable) item.Cell = null;
                    _title.push(item);

                });
                this.setState({ dataList: [] });
                this.setState({ title: _title });

            } else {
                if (confirm('Все несохраненные данные будут потеряны! Вы уверены?')) {
                    // Save it!
                    this.setState({
                        [event.target.name]: toggled
                    });
                    //_props = this.state.title;

                    title.map(item => {
                        if (item.Cell === this.renderEditable) item.Cell = null;
                        _title.push(item);

                    });
                    this.map_load();
                    this.setState({ dataList: [] });

                    this.setState({ title: _title });

                } else { return true; }
            }
        }
        //}
    };

    handleActivate() {
        var filter = [];
        const { points_list } = this.state;

        if (this.state.point_actual) {
            if (this.state.inMeasure) {
                var isReal = confirm("Вы уверены, что хотите завершить текущее наблюдение и активировать другую точку?...");

                if (isReal) {
                    this.props.updatePoint({ idd: this.state.iddMeasure }).then(resp => {
                        if (resp.status == 200) {
                            this.props.changePoint({ idd: this.state.point_actual }).then(resp => {
                                if (resp.status == 200) {
                                    this.map_load();

                                    filter = points_list.filter((item) => {
                                        return item.idd == this.state.point_actual;
                                    });

                                    this.setState({ point_actual: '', selection: '' });

                                    this.setState({ isLoading: true });
                                    this.setState({ snack_msg: 'Наблюдения завершены. Иная точка наблюдения загружена...' });
                                    this.toggleSelection(this.state.point_actual, '', this.state.selection);
                                    deleteActiveStationsList();

                                } else {
                                    this.setState({ isLoading: true });
                                    this.setState({ snack_msg: 'Ошибка сервера...' });
                                }
                            })

                        } else {
                            this.setState({ isLoading: true });
                            this.setState({ snack_msg: 'Ошибка сервера...' });
                        };
                    });
                };
            } else {
                this.props.changePoint({ idd: this.state.point_actual }).then(resp => {
                    if (resp.status == 200) {
                        this.map_load();

                        filter = points_list.filter((item) => {
                            return item.idd == this.state.point_actual;
                        });

                        this.setState({ point_actual: '', selection: '' });

                        this.setState({ isLoading: true });
                        this.setState({ snack_msg: 'Точка наблюдения загружена...' });
                        this.toggleSelection(this.state.point_actual, '', this.state.selection);
                        deleteActiveStationsList();

                    } else {
                        this.setState({ isLoading: true });
                        this.setState({ snack_msg: 'Ошибка сервера...' });
                    }
                })
            }
            if (filter.length > 0)
                timeAddAction({ date_time_end: filter[0].date_time_end });
        } else {
            alert("Необходимо выбрать точку...");
        }
    };

    handleAddPoint() {
        if (!this.state.inMeasure) {
            this.setState({ openDialog: true, descr: '', place: '', idd: uuid(), lat: this.state.lat, lon: this.state.lon });
        } else {
            alert("Необходимо завершить сбор данных для данной точки наблюдения - затем создать новую?...");
        }
    }

    handleMeasureActivate() {
        var filter = [];
        const { points_list } = this.state;

        if (this.state.point_actual) {
            if (!this.state.inMeasure) {
                var isReal = confirm("Вы уверены, что хотите начать сбор данных для данной точки наблюдения?...");

                if (isReal) {
                    this.props.measureActivate({ idd: this.state.point_actual }).then(resp => {
                        if (resp.status == 200) {
                            //this.props.changePoint({ idd: this.state.point_actual }).then(resp => {
                            // if (resp.status == 200) {
                            this.map_load();

                            //    filter = points_list.filter((item) => {
                            //        return item.idd == this.state.point_actual;
                            //    });

                            this.setState({ inMeasure: true });

                            this.setState({ isLoading: true });
                            this.setState({ snack_msg: 'Начат сбор данных для данной точки...' });
                            this.toggleSelection(this.state.point_actual, '', this.state.selection);

                            //  } else {
                            //     this.setState({ isLoading: true });
                            //     this.setState({ snack_msg: 'Ошибка сервера...' });
                            // }
                            //})

                        } else {
                            this.setState({ isLoading: true });
                            this.setState({ snack_msg: 'Ошибка сервера...' });
                        };
                    });
                };
            } else {
                alert("Сбор данных в данной точке уже идет...");

            }

        } else {
            alert("Необходимо выбрать точку...");
        }
    };

    handleMeasureStop() {
        var filter = [];
        const { points_list } = this.state;

        if (this.state.point_actual) {
            if (this.state.inMeasure) {
                var isReal = confirm("Вы уверены, что хотите остановить сбор данных для данной точки наблюдения?...");

                if (isReal) {
                    this.props.measureStop({
                        idd: this.state.iddMeasure, date_time_begin: this.props.active_point.begin_measure_time,
                        place: this.props.active_point.place, descr: this.props.active_point.descr, lat: this.props.active_point.lat, lon: this.props.active_point.lon
                    }).then(resp => {
                        if (resp.status == 200) {
                            // this.props.changePoint({ idd: this.state.point_actual }).then(resp => {
                            // if (resp.status == 200) {
                            this.map_load();

                            //    filter = points_list.filter((item) => {
                            //        return item.idd == this.state.point_actual;
                            //    });

                            this.setState({ inMeasure: false });

                            this.setState({ isLoading: true });
                            this.setState({ snack_msg: 'Остановлен сбор данных для данной точки...' });
                            this.toggleSelection(this.state.point_actual, '', this.state.selection);
                            // } else {
                            //     this.setState({ isLoading: true });
                            //     this.setState({ snack_msg: 'Ошибка сервера...' });
                            // }
                            // })

                        } else {
                            this.setState({ isLoading: true });
                            this.setState({ snack_msg: 'Ошибка сервера...' });
                        };
                    });
                };
            } else {
                alert("Сбор данных в данной точке уже остановлен...");

            }

        } else {
            alert("Необходимо выбрать точку...");
        }
    };


    handleLockClick() {
        if (this.state.inMeasure) {
            var isReal = confirm("Вы уверены, что хотите завершить текущее наблюдение?...");

            if (isReal) {
                this.props.updatePoint({ idd: this.state.iddMeasure }).then(resp => {
                    if (resp.status == 200) {

                        this.map_load();
                        this.setState({ point_actual: '', selection: '' });

                        this.setState({ isLoading: true });
                        this.setState({ snack_msg: 'Наблюдения завершены...' });
                        this.toggleSelection(this.state.point_actual, '', this.state.selection);


                    } else {
                        this.setState({ isLoading: true });
                        this.setState({ snack_msg: 'Ошибка сервера...' });
                    };
                });
            };
        }
    };

    handleDeleteClick() {


        if (!isEmpty(this.state.point_actual)) {
            var isReal = confirm("Вы уверены, что хотите удалить точку наблюдения?...");

            if (isReal) {
                this.props.deletePoint(this.state.point_actual).then(resp => {
                    if (resp.status == 200) {
                        this.map_load();
                        this.setState({ point_actual: '', selection: '' });

                        this.setState({ isLoading: true });
                        this.setState({ snack_msg: 'Данные удалены...' });
                        timeDeleteAction();
                    } else {
                        this.setState({ isLoading: true });
                        this.setState({ snack_msg: 'Ошибка сервера...' });
                    };
                });
            };
        }

    };

    componentDidMount() {


        const { stationsList } = this.props;
        let params = {};
        // this.props.queryEvent(params).then(data => {
        //    let lat, lng = 0;
        //   let params = {};
        //   params.period_from = this.state.dateTimeBegin;
        //   params.period_to = this.state.dateTimeEnd;

        //  getStationsList(data);
        this.map_load();
        // })


    }



    onClick(event) {
        if (event == 'true')
            window.open("https://map.gpshome.ru/main/index.php?login=mosoblecomon&password=mosoblecomon");
    }

    handleDialogAdd() {
        let { idd, descr, place, lat, lon } = this.state;

        if (isEmpty(descr) && isEmpty(place)) {
            //insert action

            alert("Адрес и описание точки не может быть одновременно не заполнено!");

        } else {

            this.props.insertPoint({ idd, descr, place, lat, lon })
                .then(resp => {

                    if (resp.status == 200) {
                        this.setState({ snack_msg: 'Данные успешно добавлены...' });
                        this.setState({ isLoading: true });
                        deleteActiveStationsList();
                        this.map_load();

                    } else {
                        this.setState({ snack_msg: 'Ошибка сервера...' });

                        this.setState({ isLoading: true });
                    };
                    this.setState({ openDialog: false });

                });


        }

    }

    handleDialogClose() {
        this.setState({ openDialog: false });
    };

    handleDialogChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    handleTableCellClick(
        state,
        rowInfo,
        column,
        instance,
        ...rest
    ) {
        if (typeof rowInfo !== "undefined") {
            const needsExpander =
                rowInfo.subRows && rowInfo.subRows.length > 1 ? true : false;
            const expanderEnabled = !column.disableExpander;
            const expandedRows = Object.keys(this.state.expanded)
                .filter(expandedIndex => {
                    return this.state.expanded[expandedIndex] !== false;
                })
                .map(Number);

            const rowIsExpanded =
                expandedRows.includes(rowInfo.nestingPath[0]) && needsExpander
                    ? true
                    : false;
            const newExpanded = !needsExpander
                ? this.state.expanded
                : rowIsExpanded && expanderEnabled
                    ? {
                        ...this.state.expanded,
                        [rowInfo.nestingPath[0]]: false
                    }
                    : {
                        ...this.state.expanded,
                        [rowInfo.nestingPath[0]]: {}
                    };

            return {
                style:
                    needsExpander && expanderEnabled
                        ? { cursor: "pointer" }
                        : { cursor: "auto" },
                onClick: (e, handleOriginal) => {
                    this.setState({
                        expanded: newExpanded
                    });
                }
            };
        } else {
            return {
                onClick: (e, handleOriginal) => {
                    if (handleOriginal) {
                        handleOriginal();
                    }
                }
            };
        }
    };

    onExpandedChange(newExpanded) {
        this.setState({
            expanded: newExpanded
        });
    }

    render() {
        const { toggleSelection, toggleAll, isSelected } = this;
        const { selection, selectAll, stationsList, auth, height, defaultPageSize, stripedRows, title } = this.state;
        const { loadData } = this.props;
        const { classes } = this.props;
        const { sensorsList } = this.props;
        const { tab_no } = this.state;

        const { points_list } = this.state;
        const { snack_msg, isLoading } = this.state;
        const _header = [{
            Header: "Перечень точек отбора",
            columns: title
        }];

        // var tableData = this.state.stationsList;
        // const { title, errors, isLoading } = this.state;
        //const {handleChange, handleToggle} = this.props;
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
        const checkboxProps = {
            selection,
            selectAll: false,
            isSelected: isSelected.bind(this),
            toggleSelection: toggleSelection.bind(this),
            selectType: "checkbox",
            getTrProps: (s, r) => {
                let selected = false;
                // someone asked for an example of a background color change
                // here it is...
                if (r) {
                    if (r.original)
                        selected = this.isSelected(r.original._id);
                }
                return {
                    style: {
                        backgroundColor: selected ? "lightblue" : "inherit"
                        // color: selected ? 'white' : 'inherit',
                    }
                };
            }
        };

        const Tips = () =>
            <div style={{ textAlign: "center" }}>
                <em>Для сортировки по нескольким полям удерживайте клавишу Shift!</em>
            </div>;



        return (


            <Paper className={classes.root}>
                <br />

                <PointDialog
                    openDialog={this.state.openDialog}
                    lat={this.state.lat}
                    lon={this.state.lon}
                    idd={this.state.idd}

                    handleSnackClose={this.handleSnackClose.bind(this)}

                    handleDialogClose={this.handleDialogClose.bind(this)}
                    handleAdd={this.handleDialogAdd.bind(this)}
                    handleChange={this.handleDialogChange.bind(this)}
                />

                <MenuPoints
                    handleAddPoint={this.handleAddPoint.bind(this)}
                    handleMeasureActivate={this.handleMeasureActivate.bind(this)}
                    handleMeasureStop={this.handleMeasureStop.bind(this)}
                    handleActivate={this.handleActivate.bind(this)}
                    handleLockClick={this.handleLockClick.bind(this)}
                    handleDeleteClick={this.handleDeleteClick.bind(this)}
                    handleUpdateData={this.handleUpdateData.bind(this)}
                    handleToggleEdit={this.handleToggleEdit.bind(this)}
                    handleToggle={this.handleToggle.bind(this)}
                    handleChange={this.handleChange.bind(this)}
                    handleClick={this.handleClick.bind(this)}
                    isStation={true} {...this.state}
                    handleClose={this.handleClose.bind(this)}
                    auth={auth}
                />
                <br />

                <div >
                    <CheckboxTable
                        //getTrProps={this.handleTableCellClick}
                        //onExpandedChange={newExpanded => this.onExpandedChange(newExpanded)}
                        //expanded={this.state.expanded}
                        //pivotBy={["idd"]}

                        ref={r => (this.checkboxTable = r)}
                        {...checkboxProps}
                        data={points_list}
                        columns={_header}
                        PageSize={defaultPageSize}
                        previousText={'Предыдущие'}
                        nextText={'Следующие'}
                        loadingText={'Loading...'}
                        noDataText={'Записей не найдено'}
                        pageText={'Страница'}
                        ofText={'из'}
                        rowsText={'записей'}
                        style={{
                            height: height,  // This will force the table body to overflow and scroll, since there is not enough room
                            backgroundColor: stripedRows ? '#000000' : '',
                            color: stripedRows ? '#FFFFFF' : ''
                        }}
                        className="-striped -highlight"
                        {...this.state}
                    />
                    <br />
                    <Tips />
                </div>



            </Paper >
        );
    }
}

function mapStateToProps(state) {

    return {
        stationsList: state.stationsList,
        active_point: state.points[0].active_point
    };
}


PointsForm.propTypes = {
    classes: PropTypes.object.isRequired,

    //loadData: PropTypes.func.isRequired
}

PointsForm.contextType = {
    // router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, {
    queryEvent, queryOperativeEvent, getPoint, updatePoint, insertPoint, deletePoint, updatePointAll, changePoint, timeAddAction, timeDeleteAction,
    measureActivate, measureStop, getActivePoint, pointAddAction, pointDeleteAction, deleteActiveStationsList
})(withRouter(withStyles(styles)(PointsForm)));
