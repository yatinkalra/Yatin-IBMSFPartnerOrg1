/**
 * @description       : Container component for Header, Body(Datatable), Footer(Pagination, Save/Generate events)
 *                      Fire navigation, Week scroll event, send data to header, body and footer components
 * @author            : Jeetendra Jadhav
 * @group             : 
 * @last modified on  : 08-10-2022
 * @last modified by  : Jeetendra Jadhav
**/
import { LightningElement, wire } from 'lwc';
import getShiftUIConfiguration from '@salesforce/apex/PD_CWE_GenerateShiftService.getShiftUIConfiguration';

export default class Pdcwe_shiftCreationContainer extends LightningElement {
    showSpinner = true;
    isDataTableGenerated = false;
    weekNavigateValue = 'norefresh';
    pageSize;
    pagesToDisplay;
    recordCount;
    isPageOnload = true;
    navigateOnlyPage = false;
    isSaveEvent = false;
    pageNumber = 1;
    weekScrollCount;
    enableGenerateButton;
    inProgressStatusColor;
    adjustedStatusColor;
    saveStatusColor;
    maxDate;
    minDate;
    selectedDate;
    noOfWeeksToScroll;
    noOfWeeksOnPage

    @wire(getShiftUIConfiguration,{developerName: 'Generate_Shift_Configuration'})
    wiredConfig({ error, data }) {
        if (data) {
            this.pageSize = data.Records_to_display__c;
            this.pagesToDisplay = data.Pages_to_Display_on_Pagination__c;
            this.inProgressStatusColor = 'background-color:' + data.Color_Code_for_In_Progress__c;
            this.saveStatusColor = 'background-color:' + data.Color_Code_for_Save__c;
            this.adjustedStatusColor = 'background-color:' + data.Color_Code_for_Adjustment__c;
            this.errorStatusColor = 'background-color:' + data.Color_Code_for_Error__c;
            this.noOfWeeksToScroll = data.No_of_Weeks_to_Scroll__c;
            this.noOfWeeksOnPage = data.Total_No_of_Weeks_on_Page__c;
            this.isDataTableGenerated = true;
        } else if (error) {

        }
    }

    loadPageData(event) {
        this.recordCount = event.detail.data.recordCount;
        this.navigateOnlyPage = true;
        this.showSpinner = false;
        this.weekNavigateValue = 'norefresh';
        this.weekScrollCount = event.detail.data.weekScrollCount
        this.enableGenerateButton = event.detail.data.enableGenerateButton;
        this.maxDate = event.detail.data.maxDate;
        this.minDate = event.detail.data.minDate;
    }

    handlenavigation(event) {
        if (this.pageNumber != event.detail.pageNum) {
            this.showSpinner = true;
            this.navigateOnlyPage = true;
            this.pageNumber = event.detail.pageNum;
            if (this.isPageOnload) {
                this.showSpinner = false;
                this.isPageOnload = false;
            }
        }
    }

    fireShiftSaveEvent() {
        this.showSpinner = true;
        this.isSaveEvent = true;
        this.template.querySelector("c-pdcwe_shift-creation-data-table").saveShiftDetailsFromUI();
    }

    navigateWeek(event) {
        this.navigateOnlyPage = false;
        this.weekNavigateValue = event.detail.goTo;
        this.showSpinner = true;
    }

    saveDone() {
        this.navigateOnlyPage = true;
        this.showSpinner = true;
        this.template.querySelector("c-pdcwe_shift-creation-data-table").loadTable();
    }

    refreshTable() {
        this.showSpinner = true;
        this.template.querySelector("c-pdcwe_shift-creation-data-table").loadTable();
    }

    fireGenerateShift() {
        this.showSpinner = true;
        //this.isSaveEvent = true;
        this.template.querySelector("c-pdcwe_shift-creation-data-table").generateShifts();
    }

    noShiftChange() {
        this.showSpinner = false;
    }

    errorOnLoad() {
        this.showSpinner = false;
    }

    dateselection(event) {
        this.navigateOnlyPage = false;
        this.selectedDate = event.detail.selectedDate;
        this.showSpinner = true;
    }

    clearDate(event) {
        this.navigateOnlyPage = true;
        let previousSelectedDate = this.selectedDate;
        this.selectedDate = event.detail.selectedDate;
        this.showSpinner = true;
        if(previousSelectedDate === event.detail.selectedDate){
            this.template.querySelector("c-pdcwe_shift-creation-data-table").loadTable();
        }
    }
}