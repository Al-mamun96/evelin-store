type Review={name:string;rating:number;text:string};
/** Exclude the old admin form's exact starter entry without deleting saved data. */
export function publicReviews<T extends Review>(reviews:T[]):T[]{
 return reviews.filter(review=>review.name.trim()&&review.text.trim()&&!(review.name.trim()==='Customer name'&&review.text.trim()==='Loved the fit and finish.'));
}
