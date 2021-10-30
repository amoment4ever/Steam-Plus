export const getBuyerKYC = () => {
  const $state =
    document.getElementById(`billing_state_buynow`) ||
    document.getElementById(`billing_state`)
  const $firstName =
    document.getElementById(`first_name_buynow`) ||
    document.getElementById(`first_name`)
  const $lastName =
    document.getElementById(`last_name_buynow`) ||
    document.getElementById(`last_name`)
  const $billingAddress =
    document.getElementById(`billing_address_buynow`) ||
    document.getElementById(`billing_address`)
  const $billingAddress2 =
    document.getElementById(`billing_address_two_buynow`) ||
    document.getElementById(`billing_address_two`)
  const $country =
    document.getElementById(`billing_country_buynow`) ||
    document.getElementById(`billing_country`)
  const $city =
    document.getElementById(`billing_city_buynow`) ||
    document.getElementById(`billing_city`)
  const $postal =
    document.getElementById(`billing_postal_code_buynow`) ||
    document.getElementById(`billing_postal_code`)

  return {
    first_name: $firstName !== null ? encodeURIComponent($firstName.value) : '',
    last_name: $lastName !== null ? encodeURIComponent($lastName.value) : '',
    billing_address:
      $billingAddress !== null ? encodeURIComponent($billingAddress.value) : '',
    billing_address_two:
      $billingAddress2 !== null
        ? encodeURIComponent($billingAddress2.value)
        : '',
    billing_country:
      $country !== null ? encodeURIComponent($country.value) : '',
    billing_city: $city !== null ? encodeURIComponent($city.value) : '',
    billing_state: $state !== null ? encodeURIComponent($state.value) : '',
    billing_postal_code:
      $postal !== null ? encodeURIComponent($postal.value) : '',
  }
}
