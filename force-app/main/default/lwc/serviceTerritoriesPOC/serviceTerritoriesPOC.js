import { LightningElement } from 'lwc';

export default class ServiceTerritoriesPOC extends LightningElement {
    /* Using @track decorator to render the UI, after the selection of items */
    activeSectionMessage = '';
    accordionVisible = true;
    accordionSections = [
        {
            id: 'A',
            title: 'Accordion Title A',
            items: [
                { value: 'Option1', label: 'Picklist Option 1', checked: false },
                { value: 'Option2', label: 'Picklist Option 2', checked: false },
                { value: 'Option3', label: 'Picklist Option 3', checked: false },
            ]
        },
        {
            id: 'B',
            title: 'Accordion Title B',
            items: [
                { value: 'Option4', label: 'Picklist Option 4', checked: false },
                { value: 'Option5', label: 'Picklist Option 5', checked: false },
                { value: 'Option6', label: 'Picklist Option 6', checked: false },
            ]
        }
    ];

    toggleAccordion() {
        this.accordionVisible = !this.accordionVisible;
    }

    handleToggleSection(event) {
        this.activeSectionMessage = 'Open section name: ' + event.detail.openSections;
    }

    handleCheckboxChange(event) {
        const sectionName = event.target.dataset.sectionName;
        const value = event.target.value;
        const isChecked = event.target.checked;

        console.log('Checkbox Change:', sectionName, value, isChecked);

        this.accordionSections = this.accordionSections.map(section => {
            if (section.title === sectionName) {
                section.items = section.items.map(item => {
                    if (item.value === value) {
                        item.checked = isChecked;
                    }
                    return item;
                });
            }
            return section;
        });
    }

    handleRetrieve() {
        const selectedItems = [];

        this.accordionSections.forEach(section => {
            section.items.forEach(item => {
                if (item.checked) {
                    selectedItems.push({ sectionName: section.title, itemName: item.label });
                }
            });
        });

        console.log('handleRetrieve function called');
        console.log('Selected Items:', selectedItems);

        if (selectedItems.length === 0) {
            console.log('No items are selected.');
        }

        return selectedItems;
    }

}