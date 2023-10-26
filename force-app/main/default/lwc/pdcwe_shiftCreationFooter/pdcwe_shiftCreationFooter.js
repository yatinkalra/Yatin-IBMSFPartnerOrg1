/**
 * @description       : Footer componenet which includes pagination.
 *                      Page navigation, Save shifts and Generate shift events
 * @author            : Arpita Bose
 * @group             : 
 * @last modified on  : 07-31-2022
 * @last modified by  : Jeetendra Jadhav
**/
import { LightningElement, api } from 'lwc';

export default class Pdcwe_shiftCreationFooter extends LightningElement {
    @api pageSize;
    @api pagesToDisplay;
    @api recordCount;
    isGenerateEnable;

    @api
    get enableGenerateButton() {
        return this.isGenerateEnable;
    }

    set enableGenerateButton(value) {
        this.isGenerateEnable = value
        this.generateButtonAction();
    }

    generateButtonAction() {
        const generateBtn = this.template.querySelector('.generateBtn');
        if (generateBtn != undefined && generateBtn != null) {
            if (this.isGenerateEnable) {
                generateBtn.disabled = false;
            } else {
                generateBtn.disabled = true;
            }
        }
    }

    renderedCallback() {
        this.generateButtonAction();
    }

    generateShift() {
        const generateshift = new CustomEvent('generateshift', {
            bubbles: true,
            composed: true,
            detail: {
            }
        });
        this.dispatchEvent(generateshift);

    }

    saveShift() {
        const savedraftshift = new CustomEvent('savedraftshift', {
            bubbles: true,
            composed: true,
            detail: {
            }
        });
        this.dispatchEvent(savedraftshift);
    }

    callcontainerpagenavigation(event) {
        const pageclickEvent = new CustomEvent('handlepagenavigation', {
            bubbles: true,
            composed: true,
            detail: {
                pageNum: event.detail.pageNum
            }
        });
        this.dispatchEvent(pageclickEvent);
    }
}