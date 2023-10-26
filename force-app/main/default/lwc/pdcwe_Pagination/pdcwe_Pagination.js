/**
 * @description       : Pagination for Data table records
 * @author            : Arpita Bose
 * @group             : 
 * @last modified on  : 08-17-2022
 * @last modified by  : Jeetendra Jadhav
**/
import { LightningElement, api, track } from 'lwc';

const DELAY = 100;     //milliseconds
export default class Pdcwe_Pagination extends LightningElement {


    @api pageSize;
    @api pagesToDisplay;
    priorPagesToDisplay;
    totalPages;

    @track currentPageNumbers = [];
    currentSelectedPage = 1;
    currentFirstPage = 0;
    currentLastPage = 0;
    morePagesBtnLabel = '...';
    recordSize;

    @api
    get recordCount() {
        return this.recordSize;
    }

    set recordCount(value) {
        this.recordSize = value
        this.currentPageNumbers = [];
        this.currentSelectedPage = 1;
        this.currentFirstPage = 0;
        this.currentLastPage = 0;
        this.invokePagination()
    }
    connectedCallback() {
        this.invokePagination();
    }

    renderedCallback() {
        this.pageNumClickActions();
    }

    invokePagination() {
        this.totalPages = Math.ceil(this.recordSize / this.pageSize);
        this.priorPagesToDisplay = Math.floor(this.pagesToDisplay / 2);
        this.loadMorePageNumbers();
    }

    get hasMorePages() {
        return this.currentLastPage < this.totalPages ? true : false;
    }

    get startPageNumToLoad() {
        return this.currentSelectedPage - this.priorPagesToDisplay > 0 ? this.currentSelectedPage - this.priorPagesToDisplay : 1;
    }

    loadMorePageNumbers() {
        this.currentPageNumbers = [];

        for (let i = 0; i < this.pagesToDisplay; i++) {
            let pageToPush = this.startPageNumToLoad + i;

            //Do not load more pages than totalPages
            if (Number(pageToPush) <= Number(this.totalPages)) {
                this.currentPageNumbers.push(pageToPush);
            }
        }

        //sort numbers ascending
        //this.currentPageNumbers.sort();
        this.currentPageNumbers.sort(function(a, b) {
            return a - b;
          });

        this.currentFirstPage = this.currentPageNumbers[0];
        this.currentLastPage = this.currentPageNumbers[this.pagesToDisplay - 1];
    }

    pageClickHandler(event) {
        event.preventDefault();
        let selectedPageNumber = event.target.text;
        if (this.currentSelectedPage === Number(selectedPageNumber)) {
            return;
        }
        //TODO: Fire event
        if (selectedPageNumber) {
            this.currentSelectedPage = Number(selectedPageNumber);

            //if slected page is first or last page in the display then load more pages
            if (this.currentSelectedPage === this.currentFirstPage ||
                this.currentSelectedPage === this.currentLastPage) {
                this.loadMorePageNumbers();
            }
            this.pageNumClickActions();
        }
    }

    prevBtnHandler(event) {
        this.currentSelectedPage--;

        if (this.currentSelectedPage === this.currentFirstPage) {
            this.loadMorePageNumbers();
        } else {
            this.pageNumClickActions();
        }
    }

    nextBtnHandler(event) {
        this.currentSelectedPage++;

        if (this.currentSelectedPage === this.currentLastPage) {
            this.loadMorePageNumbers();
        } else {
            this.pageNumClickActions();
        }
    }

    pageNumClickActions() {
        this.disableEnableButtons();
        this.highlightPageNumDelay(this.currentSelectedPage);
        this.firePageClickEvent(this.currentSelectedPage);
    }

    disableEnableButtons() {
        const prevBtn = this.template.querySelector(".prevBtn");

        if (prevBtn) {
            prevBtn.disabled = this.currentSelectedPage === 1 ? true : false;
        }

        const nextBtn = this.template.querySelector(".nextBtn");

        if (nextBtn) {
            nextBtn.disabled = this.currentSelectedPage === this.totalPages ? true : false;
        }
    }

    firePageClickEvent(pageNum) {
        const pageclickEvent = new CustomEvent('navigatetopage', {
            bubbles: true,
            composed: true,
            detail: {
                pageNum: pageNum
            }
        });
        this.dispatchEvent(pageclickEvent);
    }

    highlightPageNumDelay(pageNum) {
        window.clearTimeout(this.delayTimeout);
        this.delayTimeout = setTimeout(() => {
            this.highlightPageNum(pageNum);
        }, DELAY);
    }

    highlightPageNum(pageNum) {
        //remove activePage class from all page numbers
        this.template.querySelectorAll(".dummyAnch")
            .forEach(element => {
                element.classList.remove('activePage');
            });

        //add activePage class to page Number clicked
        const pageElem = this.template.querySelector(`[data-id="${pageNum}"]`);

        if (pageElem) {
            pageElem.classList.add('activePage');
        }
    }
}