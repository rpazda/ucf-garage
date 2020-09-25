# Notes
- Domain based on dateTime is probably not going to work if we want to superimpose multiple days for a single garage. May be better to use a "minutes from midnight" time due to the pattern of the views. Should simplify the x domain and reduce some of the data refinement.
    - Solution: Domain based on day length, timestamps in specific dataset modulo day length to be applied after filtering but before visualization construction
    -  Complicated by reduction of collection window. This will affect the domain but not the data. Domain should be consistent but may require some diligence especially concerning older data collected before narrowed time collection.

- Is it valuable for the paths to be superimposed among different days or would it be both simpler and more expressive to keep the axes/scale consistent and labeled but the graphs distinct?

## Potential Views
- Last x Tuesdays, Wednesdays etc.

## TODO
- Add day of week to current date display