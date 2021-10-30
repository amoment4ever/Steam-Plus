/* eslint-disable */
export const TRADEODDER_STATE = {
  Invalid: 1, // Invalid
  Active: 2, // This trade offer has been sent, neither party has acted on it yet.
  Accepted: 3, // The trade offer was accepted by the recipient and items were exchanged.
  Countered: 4, // The recipient made a counter offer
  Expired: 5, // The trade offer was not accepted before the expiration date
  Canceled: 6, // The sender cancelled the offer
  Declined: 7, // The recipient declined the offer
  InvalidItems: 8, // Some of the items in the offer are no longer available (indicated by the missing flag in the output)
  CreatedNeedsConfirmation: 9, // The offer hasn't been sent yet and is awaiting email/mobile confirmation. The offer is only visible to the sender.
  CanceledBySecondFactor: 10, // Either party canceled the offer via email/mobile. The offer is visible to both parties, even if the sender canceled it before it was sent.
  InEscrow: 11, // The trade has been placed on hold. The items involved in the trade have all been removed from both parties' inventories and will be automatically delivered in the future.
};
