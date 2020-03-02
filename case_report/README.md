# Case reporting using React
A React tool to fill case reports based on predefined radiology reporting templates.

## Supported template formats
* MRRT

## Workflow
1. Load the list of templates associated with a project
2. User selects which template to fill
3. Template is parsed for data to be rendered
4. Template is rendered into UI wizard
    * Template sections are split as wizard pages
    * User cannot move to a next page if an input with a mandatory value is empty
5. Measurements and contours can be dragged and dropped from a side-panel
6. DCMSR document is generated and stored upon submitting the case report
    * Other formats (e.g. PDF) can be generated

## Current progress
1. Done
2. Done
3. 20% done