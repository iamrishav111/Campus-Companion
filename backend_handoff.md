### Message to your friend:

"Hey! Can you update the **`update-ticket`** endpoint in `app.py` on the Render backend? The frontend now supports updating the ticket category in real-time, so I need the backend `PUT` route to accept it.

Just replace the current `TicketUpdate` model and `update_ticket` function with this snippet, then commit and push it so Render rebuilds it:"

```python
# ================= UPDATE TICKET =================
class TicketUpdate(BaseModel):
    ticket_id: str
    status: str | None = None
    assigned_to: str | None = None
    category: str | None = None  # ADDED THIS LINE


@app.put("/update-ticket")
def update_ticket(data: TicketUpdate):
    ticket_ref = db.collection("tickets").document(data.ticket_id)

    update_data = {}

    if data.status:
        update_data["status"] = data.status

    if data.assigned_to is not None:
        update_data["assigned_to"] = data.assigned_to

    # ADDED THIS BLOCK
    if data.category is not None:
        update_data["category"] = data.category

    update_data["updated_at"] = datetime.utcnow()

    ticket_ref.update(update_data)

    return {
        "message": "Ticket updated successfully",
        "updated_fields": update_data
    }
```
