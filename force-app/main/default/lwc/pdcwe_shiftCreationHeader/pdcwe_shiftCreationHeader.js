/**
 * @description       : Header component for Shift Calendar.
                        Includes Week scroll event
 * @author            : Jeetendra Jadhav
 * @group             : 
 * @last modified on  : 08-09-2022
 * @last modified by  : Jeetendra Jadhav
**/

import { LightningElement, api } from 'lwc';
import cmpTitle from '@salesforce/label/c.PD_CWE_Shift_Calendar_Title';
export default class Pdcwe_shiftCreationHeader extends LightningElement {

    cmpTitle = cmpTitle;

    nextCount = 0;
    prevCount = 0;
    @api saveLegend
    @api inProgressLegend
    @api adjustedLegend
    @api errorLegend

    @api minDate;
    @api maxDate;
    weekScrollSize
    @api noOfWeeksOnPage;
    @api noOfWeeksToScroll;
    dateSelected = '';
    showDateClear;

    renderedCallback() {
        if (this.noOfWeeksOnPage != undefined && this.noOfWeeksToScroll != undefined) {
            this.weekScrollSize = Math.round(parseInt(this.noOfWeeksToScroll) / parseInt(this.noOfWeeksOnPage));
        }
    }

    getWeekStartDate(date) {
        return date.getDate() - date.getDay();
    }
    navigateWeek(event) {
        let navigateValue = event.target.dataset.id;
        const nextBtn = this.template.querySelector('.nextBtn');
        const prevBtn = this.template.querySelector('.prevBtn');

        if (navigateValue === 'next') {
            this.nextCount++;
            this.prevCount--;
            prevBtn.disabled = false;
            if (this.nextCount === this.weekScrollSize) {
                nextBtn.disabled = true;
            }
        } else if (navigateValue === 'previous') {
            this.prevCount++;
            this.nextCount--;
            nextBtn.disabled = false;
            if (this.prevCount === 0) {
                prevBtn.disabled = true;
            }
        }

        const pageclickEvent = new CustomEvent('navigate', {
            bubbles: true,
            composed: true,
            detail: {
                goTo: navigateValue
            }
        });
        this.dispatchEvent(pageclickEvent);
    }


    onDateChange(event) {
        let selectedDate = new Date(event.target.value);
        this.dateSelected = event.target.value;
        this.changeNavigateButtons();
        this.showDateClear = this.dateSelected != undefined && this.dateSelected != null ? true : false;
        var minDate = new Date(this.minDate);
        var maxDate = new Date(this.maxDate);
        if (selectedDate >= minDate && selectedDate < maxDate) {
            const pageclickEvent = new CustomEvent('dateselection', {
                bubbles: true,
                composed: true,
                detail: {
                    selectedDate: selectedDate
                }
            });
            this.dispatchEvent(pageclickEvent);
        }
    }

    changeNavigateButtons() {
        const nextBtn = this.template.querySelector('.nextBtn');
        const prevBtn = this.template.querySelector('.prevBtn');
        nextBtn.disabled = true;
        prevBtn.disabled = true;
    }

    weeksBetween(d1, d2) {
        return Math.round((d2 - d1) / (7 * 24 * 60 * 60 * 1000));
    }

    clearDate() {
        this.dateSelected = '';
        this.showDateClear = false;
        const nextBtn = this.template.querySelector('.nextBtn');
        const prevBtn = this.template.querySelector('.prevBtn');
        nextBtn.disabled = false;
        prevBtn.disabled = true;
        this.nextCount = 0;
        this.prevCount = 0;
        const pageclickEvent = new CustomEvent('cleardate', {
            bubbles: true,
            composed: true,
            detail: {
                selectedDate: ''
            }
        });
        this.dispatchEvent(pageclickEvent);
    }
}