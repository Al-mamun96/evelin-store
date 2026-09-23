# Evelin admin ব্যবহারের সহজ নিয়ম

আপনার domain-এর শেষে `/admin` খুলুন। Coolify-এ সেট করা `ADMIN_PASSWORD` দিয়ে login করুন। কোনো default password নেই। Mobile-এ ওপরের menu বামে–ডানে swipe করলে সব screen পাওয়া যাবে।

## প্রথমবার setup

1. **Products** থেকে demo product মুছুন বা নিজের তথ্য দিয়ে edit করুন। Demo ছবিগুলো বাস্তব product photo নয়।
2. **Stock** থেকে প্রত্যেক size-এর বাস্তব quantity লিখুন।
3. **Homepage** থেকে title, banner, description ও section headings দিন।
4. **Store settings** থেকে phone, email, address, delivery/return/privacy policy ও shipping charge দিন।
5. **Steadfast** থেকে API key এবং Secret key save করে **Test connection** দিন।
6. একটি controlled test order পরীক্ষা করুন। তারপর **Store is open for orders** চালু করে save করুন।

## Product তৈরি, edit, delete

**Products → Add product** চাপুন। নাম, category, দাম, description, fabric, colour, sizes ও ছবি দিন। নতুন category লিখলেই ব্যবহার করা যাবে। Size যেমন `S, M, L` অথবা `50/21, 52/22` লিখুন; comma দিয়ে আলাদা করুন। Size guide-এ বাস্তব measurement দিন।

Starting stock প্রতিটি size-এ একই quantity বসায়। পরে **Stock** থেকে size অনুযায়ী বদলাতে পারবেন। নতুন size যোগ করলে তার stock শূন্য থাকে—Stock screen থেকে quantity দিন।

**Publish on storefront** বন্ধ থাকলে product draft থাকবে। **Save product** চাপলে পরিবর্তন হবে। Photo upload করলেই product save হয় না। সর্বোচ্চ 8 MB JPG/PNG/WebP ছবি নেওয়া হয়; server ছবিটি WebP করে রাখে।

অন্য রঙের একই পোশাকের জন্য **Duplicate** ব্যবহার করুন। Copy draft হিসেবে শুরু হয় এবং নিজের stock দিতে হয়। Delete করলে পুরোনো order নষ্ট হয় না। **Deleted products → Restore** করলে draft হিসেবে ফেরত আসে; review করে publish করুন।

## Homepage বদলানো

**Homepage** screen থেকে announcement, main title, accent title, description, button label, banner photo, collections/featured headings ও brand story বদলান। **Save changes** চাপুন। খোলা পুরোনো storefront tab refresh করুন।

## Order তৈরি ও edit

**Orders → Create order** দিয়ে phone/Facebook/showroom order যোগ করুন। Customer name, mobile, full address ও shipping zone দিন। Product ও size বেছে quantity দিয়ে **Add to order** চাপুন। একাধিক product যোগ করা যাবে।

Delivery charge, discount এবং ইতিমধ্যে পাওয়া advance payment লিখুন। **COD to collect**-এ বাকি টাকা দেখাবে। Save করলে order তৈরি ও stock কমানো একসঙ্গে হয়। Advance field টাকা গ্রহণ করে না; পাওয়া টাকার হিসাব রাখে।

Existing order খুলে **Edit order** চাপুন। নাম, phone, address, zone, products, quantity, note ও charges বদলানো যাবে। পুরোনো item-এর দাম আগেরটাই থাকে; নতুন item বর্তমান দামে যোগ হয়। Save করলে বাদ দেওয়া item-এর stock ফেরে এবং নতুন quantity reserve হয়। Stock কম হলে কিছুই আংশিক save হয় না।

Courier-এ submit বা shipped হওয়ার পর address/products edit বন্ধ থাকে। ইতিমধ্যে তৈরি parcel-এর তথ্য merchant portal-এর মাধ্যমে সমাধান করতে হবে। Delivered/cancelled order পুনরায় খোলা যায় না।

## Order status ও invoice

স্বাভাবিক flow: **Pending → Confirmed → Shipped → Delivered**। **Invoice** খুলে print করুন বা browser থেকে PDF হিসেবে save করুন। Search-এ order number, customer name বা phone লিখুন; status filter ও pagination আছে।

Dispatch-এর আগে unbooked order **Cancel order** করলে stock ফেরত আসে। Shipped return হলে সব product হাতে পাওয়ার পর **Receive return & restock** দিন। একই order আবার cancel করে double stock বাড়ানো যায় না। Partial return-এ full restock ব্যবহার করবেন না; Stock screen-এ কারণ লিখে বাস্তব ফেরত আসা quantity reconcile করুন।

## Stock management

**Stock**-এ product খুঁজে size-এর **Adjust** চাপুন। নতুন **মোট available stock** ও কারণ লিখুন—যেমন নতুন চালান, physical count বা damage। এটি বাড়ানোর সংখ্যা নয়, সর্বশেষ মোট available সংখ্যা।

Pending order-এর stock আগেই reserve থাকে। Physical count করার সময় packed/reserved goods বাদ দিয়ে available quantity লিখুন। History-তে order, edit, cancellation ও manual adjustment দেখা যাবে। Low-stock threshold **Store settings** থেকে বদলাতে পারবেন।

অন্য tab/order একই stock বদলে দিলে পুরোনো count দিয়ে save হবে না। Refresh করে নতুন count মিলিয়ে আবার save করুন।

## Steadfast সেটআপ ও booking

1. নিজের merchant account থেকে API key/Secret key নিন। **Steadfast** screen-এ দুটোই দিন এবং save করুন। Secret browser-এ ফেরত দেখানো হয় না। পরে blank রাখলে আগের key থাকে।
2. **Test connection** দিয়ে balance response যাচাই করুন। এটি কোনো parcel তৈরি করে না।
3. Order **Confirm** করে **Send to Steadfast** দিন। Customer delivery details পাঠানো হবে; COD = total − advance।
4. Confirmation-এর সঙ্গে booking চাইলে **Auto-book** চালু করুন। প্রথমে live test করে তারপর এই option চালু করুন।
5. Consignment/tracking তথ্য order-এ থাকবে। **Sync status** দিয়ে update নিন। Delivered হলে local status-ও বদলাবে। Background automatic sync নেই।

Timeout/unknown error হলে আবার submit করবেন না। Steadfast portal-এ order invoice খুঁজুন, তারপর **Sync status** দিন। নিশ্চিতভাবে কোনো parcel না থাকলে এক মিনিট পরে **No parcel exists — unlock** ব্যবহার করা যাবে। ভুলভাবে unlock করলে duplicate parcel হওয়ার ঝুঁকি থাকে।

Booked parcel cancel করতে আগে merchant portal-এ ব্যবস্থা নিন। এখানে sync করে `cancelled` দেখার পর, সব goods হাতে এলে **Receive return & restock** দিন।

## দৈনন্দিন maintenance

- Overview থেকে pending order ও low stock দেখুন। Recent activity-তে কী বদলেছে দেখা যায়।
- Order নেওয়া সাময়িক বন্ধ করতে **Store settings → Store is open for orders** off করে save করুন। Site দেখা যাবে; নতুন checkout বন্ধ থাকবে। Manual admin orders করা যাবে।
- Mobile menu horizontally scroll করুন। Long stock table তার নিজের ভেতরে scroll করা যায়।
- Unsaved form ফেলে অন্য screen-এ গেলে পরিবর্তন হারাতে পারে; আগে Save করুন।
- Server admin দিয়ে নিয়মিত `node scripts/backup.mjs` চালিয়ে পুরো backup folder আলাদা secure জায়গায় রাখুন। Database, uploads এবং encryption key-এর নিরাপদ backup দরকার।
- Daily product/order/content কাজ code ছাড়া করা যাবে; server, updates, secrets ও backups-এর জন্য technical administration লাগবে।
