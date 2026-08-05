"""
Notification Service Abstraction for Student Inquiry Management System.
Allows production email and SMS integrations without altering business logic.
"""

from typing import Dict, Any, Optional
from app.core.logging_config import setup_logger

logger = setup_logger("notification_service")


class NotificationService:
    """Service abstraction handling student inquiry email and system notifications."""

    def send_inquiry_confirmation(self, inquiry_data: Dict[str, Any]) -> bool:
        """
        Sends inquiry submission confirmation email to student.
        TODO: Integrate SMTP/AWS SES/SendGrid production email delivery service.
        """
        ref_id = inquiry_data.get("reference_id", "N/A")
        email = inquiry_data.get("email", "")
        name = inquiry_data.get("name", "")
        logger.info(
            f"[NotificationService TODO] Confirmation email queued for {name} ({email}) - Reference ID: {ref_id}"
        )
        return True

    def send_inquiry_status_update(self, inquiry_data: Dict[str, Any], new_status: str) -> bool:
        """
        Sends inquiry status update notification to student.
        TODO: Integrate production email templates for status changes.
        """
        ref_id = inquiry_data.get("reference_id", "N/A")
        email = inquiry_data.get("email", "")
        name = inquiry_data.get("name", "")
        logger.info(
            f"[NotificationService TODO] Status update ({new_status}) email queued for {name} ({email}) - Reference ID: {ref_id}"
        )
        return True


notification_service = NotificationService()
