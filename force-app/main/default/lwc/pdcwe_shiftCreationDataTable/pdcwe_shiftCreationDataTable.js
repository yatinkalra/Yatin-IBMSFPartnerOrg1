/**
 * @description       : Custom data table component with lookup input as cells
 *                      Load table records on page load, page navigation, week scroll
 *                      Save records in draft and Generate shift events
 * @author            : Jeetendra Jadhav
 * @group             : 
 * @last modified on  : 08-22-2022
 * @last modified by  : Jeetendra Jadhav
**/
import { LightningElement, api } from 'lwc';
import saveShiftsInDraft from "@salesforce/apex/PD_CWE_GenerateShiftService.saveShiftsInDraft";
import getShiftRecordsForDataTable from "@salesforce/apex/PD_CWE_GenerateShiftController.getShiftRecordsForDataTable";
import generateShiftRecords from "@salesforce/apex/PD_CWE_GenerateShiftService.generateShiftRecords";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import generateMessage from '@salesforce/label/c.PD_CWE_Shift_Calendar_on_Generate';
import saveMessage from '@salesforce/label/c.PD_CWE_Shift_Calendar_on_Save';
import errorMessage from '@salesforce/label/c.PD_CWE_Shift_Calendar_Error_on_page';

export default class Pdcwe_shiftCreationDataTable extends LightningElement {
    generateMessage = generateMessage;
    errorMessage = errorMessage;
    saveMessage = saveMessage;
    tableRecords;
    tableColumns;
    generateShiftJson = [];
    columnStartDate;
    columnEndDate;
    navigateToWeek;
    pageNumber = 1;
    isNavigateOnlyPage;
    srColumnKeys;
    isPageOnLoad = true;
    selectedAccount;
    selectedTerritory;
    selectedGF;
    showTableSpinner = false;
    isGFUser = true;
    dateSelectedValue
    dtValue;
    isDateSelected = false;
    renderLookupCounter = 0;

    @api
    get dateSelected() {
        return this.dateSelectedValue;
    }

    set dateSelected(value) {
        this.isNavigateOnlyPage = true;
        this.generateShiftJson = [];
        if (this.isDateSelected && value != '') {
            this.dateSelectedValue = value;
            this.isNavigateOnlyPage = true;
            this.generateShiftJson = [];
            this.refreshDataTable();
        }
        if (value === '') {
            this.dateSelectedValue = null;
            this.isNavigateOnlyPage = false;
            this.dateSelectedValue = null;
            this.refreshDataTable();
        }
    }

    @api
    get weekNavigateValue() {
        return this.navigateToWeek;
    }

    set weekNavigateValue(value) {
        this.navigateToWeek = value
        this.isNavigateOnlyPage = false;
        this.generateShiftJson = [];
        if (this.navigateToWeek != 'norefresh' && !this.isPageOnLoad) {
            this.refreshDataTable();
        }
    }

    @api
    get pageNo() {
        return this.pageNumber;
    }

    set pageNo(value) {
        this.pageNumber = value
        this.isNavigateOnlyPage = false;
        this.generateShiftJson = [];
        if (!this.isPageOnLoad) {
            this.isNavigateOnlyPage = true;
        }
        this.refreshDataTable();
    }

    connectedCallback() {
        // set page onload to false when page is loaded
        this.isPageOnLoad = false;
        this.isDateSelected = true;
    }

    @api loadTable() {
        this.refreshDataTable();
    }
    refreshDataTable() {
        getShiftRecordsForDataTable({
            pageNumber: this.pageNumber,
            weekNavigateValue: this.navigateToWeek,
            columnStartDate: this.columnStartDate,
            columnEndDate: this.columnEndDate,
            navigateOnlyPage: this.isNavigateOnlyPage,
            vendorAccount: this.selectedAccount,
            gfUser: this.selectedGF,
            primaryTerritory: this.selectedTerritory,
            dateSelectedValue: this.dateSelectedValue,
            renderLookupCounter: this.renderLookupCounter
        })
            .then((data) => {
                if (data != null) {
                    this.showTableSpinner = false;
                    this.tableRecords = data.lstData;
                    this.tableColumns = data.lstColumns;
                    this.columnEndDate = data.weekEndateDate;
                    this.columnStartDate = data.weekStartDate;
                    this.srColumnKeys = data.setSrColumnKey;
                    this.isGFUser = data.isGFUser;
                    this.renderLookupCounter =  data.renderLookupCount;
                    if (this.tableRecords.length === 0) {
                        this.fireToastMessage('No Records found', 'info');
                    }
                    const loaddata = new CustomEvent('loaddata', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            data: {
                                recordCount: data.recordCount,
                                enableGenerateButton: this.srColumnKeys.length != 0 ? true : false,
                                maxDate: data.datePickerMaxValue,
                                minDate: data.datePickerMinValue,
                                dateSelected: data.selectedDate
                            }
                        }
                    });
                    this.dispatchEvent(loaddata);
                } else {
                    this.showTableSpinner = false;
                    this.fireToastMessage(this.errorMessage, 'error');
                    const errorinloading = new CustomEvent('errorinloading', {
                        bubbles: true,
                        composed: true,
                        detail: {}
                    });
                    this.dispatchEvent(errorinloading);
                }
            })
            .catch((error) => {
                this.error = error;
                this.showTableSpinner = false;
                const errorinloading = new CustomEvent('errorinloading', {
                    bubbles: true,
                    composed: true,
                    detail: {}
                });
                this.dispatchEvent(errorinloading);
            });
    }

    handleEdit(event) {
        event.preventDefault();
        let dataRecieved = event.detail.data;
    }

    handleChange(event) {
        var shiftSrColumnData = {};
        var temp_GenerateShift = [];
        temp_GenerateShift = this.generateShiftJson;
        let dataRecieved = event.detail.data;
        shiftSrColumnData['srId'] = dataRecieved.srId;
        shiftSrColumnData['columnDate'] = dataRecieved.columnDate;
        shiftSrColumnData['shiftPatternId'] = dataRecieved.shiftPatternId;
        shiftSrColumnData['isAppendRestoration'] = dataRecieved.isAppendRestoration;
        shiftSrColumnData['isAppendWeekOff'] = dataRecieved.isAppendWeekOff;
        if (this.generateShiftJson.length != 0) {
            this.generateShiftJson = temp_GenerateShift.filter(function (item) {
                if (item.srId === shiftSrColumnData.srId && item.columnDate === shiftSrColumnData.columnDate) {
                    return false;
                } else {
                    return true;
                }
            });
        }
        this.generateShiftJson.push(shiftSrColumnData);
    }

    handleSameValueSelection(event) {
        var shiftSrColumnData = {};
        var temp_GenerateShift = [];
        temp_GenerateShift = this.generateShiftJson;
        let dataRecieved = event.detail.data;
        shiftSrColumnData['srId'] = dataRecieved.srId;
        shiftSrColumnData['columnDate'] = dataRecieved.columnDate;
        shiftSrColumnData['shiftPatternId'] = dataRecieved.shiftPatternId;
        shiftSrColumnData['isAppendRestoration'] = dataRecieved.isAppendRestoration;
        shiftSrColumnData['isAppendWeekOff'] = dataRecieved.isAppendWeekOff;
        this.generateShiftJson = temp_GenerateShift.filter(function (item) {
            if (item.srId === shiftSrColumnData.srId && item.columnDate === shiftSrColumnData.columnDate) {
                return false;
            } else {
                return true;
            }

        });
        this.generateShiftJson.push(shiftSrColumnData);
    }

    @api saveShiftDetailsFromUI() {
        if (this.generateShiftJson.length === 0) {
            this.fireToastMessage('No changes done on shift calendar', 'info');
            const noshiftchange = new CustomEvent('noshiftchange', {
                bubbles: true,
                composed: true,
                detail: {}
            });
            this.dispatchEvent(noshiftchange);
            return;
        }

        saveShiftsInDraft({ sftData: this.generateShiftJson })
            .then((data) => {
                if (data === 'success') {
                    this.generateShiftJson = [];
                    this.isNavigateOnlyPage = true;
                    this.refreshDataTable();
                    this.fireToastMessage(this.saveMessage, 'success');
                } else {
                    this.refreshDataTable();
                    this.fireToastMessage(this.errorMessage, 'error');
                }
            })
            .catch((error) => {
                this.refreshDataTable();
                this.fireToastMessage('Something went wrong. ' + error, 'error');
            });
    }

    @api generateShifts() {
        generateShiftRecords({ lstSrColumnKeys: this.srColumnKeys })
            .then((data) => {
                //this.generateShiftJson = [];
                if (data === 'success') {
                    this.isNavigateOnlyPage = true;
                    this.refreshDataTable();
                    this.fireToastMessage(this.generateMessage, 'success');
                } else {
                    this.refreshDataTable();
                    this.fireToastMessage(this.errorMessage, 'error');
                }
            })
            .catch((error) => {
                this.refreshDataTable();
                this.fireToastMessage('Something went wrong. ' + error, 'error');
            });
    }

    fireToastMessage(message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                message: message,
                variant: variant,
            }),
        );
    }

    handleAccountChange(event) {
        this.selectedAccount = event.detail.value[0];
        this.showTableSpinner = true;
        this.pageNumber = 1;
        this.refreshDataTable();
    }

    handleGFChange(event) {
        this.selectedGF = event.detail.value[0];
        this.showTableSpinner = true;
        this.pageNumber = 1;
        this.refreshDataTable();
    }

    handleTerritoryChange(event) {
        this.selectedTerritory = event.detail.value[0];
        this.showTableSpinner = true;
        this.pageNumber = 1;
        this.refreshDataTable();
    }
}