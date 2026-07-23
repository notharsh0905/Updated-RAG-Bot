"""
Custom dataset formatters for converting raw JSON records into natural language text blocks.
Preserves all original string templates and logic from the source notebook implementation.
"""

from typing import Dict, Any


def uiet_designation_format_doc(d: Dict[str, Any]) -> str:
    """Formats UIET designation entries."""
    mobile = d.get("mobile_no") if d.get("mobile_no") else "not available"
    return (
        f"{d['name']} holds the position of {d['designation']} at CSJMU. "
        f"Contact: email {d.get('email', 'N/A')}, mobile {mobile}. "
        f"More info: {d.get('profile_url', 'N/A')}."
    )


def uiet_teachers_format_doc(entry: Dict[str, Any]) -> str:
    """Formats UIET faculty/teacher entries."""
    return (
        f"{entry['name']} sir is professor in the {entry['department']} department "
        f"{entry.get('about', '')}"
    )


def allumini_format_doc(entry: Dict[str, Any]) -> str:
    """Formats UIET alumni entries."""
    return (
        f"{entry['name']} is an allumini/alumnus/alumna of CSJM University UIET, "
        f"currently working as {entry.get('designation', 'N/A')} at {entry.get('organization', 'N/A')}."
    )


def format_admission_coordinator_doc(entry: Dict[str, Any]) -> str:
    """Formats admission coordinator entries."""
    return (
        f"{entry['Name']} is the Admission Coordinator for the {entry['Programme']} "
        f"programme at {entry['Departments']}, CSJM University. "
        f"His Contact is : {entry.get('Contact', 'N/A')}."
    )


def approved_boards_format_doc(d: Dict[str, Any]) -> str:
    """Formats approved secondary education board entries."""
    return (
        f"{d['name']} is one of the approved boards accepted by CSJMU. "
        f"Its address is {d.get('address', 'N/A')}."
    )


def course_eligibility_format_doc(d: Dict[str, Any]) -> str:
    """Formats academic course eligibility and fee entries."""
    seats = d["Seats"] if d.get("Seats") else "Not specified"
    duration = d["Duration"] if d.get("Duration") else "Not specified"
    eligibility = d["Eligibility"] if d.get("Eligibility") else "Not specified"
    fees = d["Fees (Rs.) Annual"] if d.get("Fees (Rs.) Annual") else "Not specified"
    admission = d["Admission Process"] if d.get("Admission Process") else "Not specified"

    return (
        f"{d['Name of the Programme']} is a programme offered by CSJMU. "
        f"The duration of the course is {duration}. "
        f"It has {seats} seats available. "
        f"The eligibility criteria is {eligibility}. "
        f"The annual fee is Rs. {fees}. "
        f"The admission process is {admission}."
    )


def department_format_doc(d: Dict[str, Any]) -> str:
    """Formats UIET department entries."""
    established = d.get("established", "Not Available")
    description = d.get("description", "Not Available")
    
    highlights_val = d.get("highlights", "Not Available")
    highlights = ", ".join(highlights_val) if isinstance(highlights_val, list) else str(highlights_val)

    specializations_val = d.get("specializations", "Not Available")
    specializations = ", ".join(specializations_val) if isinstance(specializations_val, list) else str(specializations_val)

    laboratories_val = d.get("laboratories", "Not Available")
    laboratories = ", ".join(laboratories_val) if isinstance(laboratories_val, list) else str(laboratories_val)

    courses_val = d.get("courses", "Not Available")
    courses = ", ".join(courses_val) if isinstance(courses_val, list) else str(courses_val)

    return (
        f"{d['name']} was established in {established}. "
        f"{description} "
        f"The key highlights of the department are {highlights}. "
        f"The department specializes in {specializations}. "
        f"The department has the following laboratories: {laboratories}. "
        f"The department offers the following courses: {courses}."
    )
