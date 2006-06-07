#!/usr/bin/perl

open (INPUT, "<elements.txt");
my @input = <INPUT>;
close INPUT;

open (OUTPUT, ">output.txt");
foreach my $line (@input) {
    $line =~ /([\w\-]+)/;  # Get the names
    my $elem = $1;
    my $name = $elem;
    $name =~ s/\-/_/g;  # Convert dashes to underscores
    $name = uc($name); # Convert it to upper case
    print OUTPUT '    "'.$name.'",'."\n";
}
foreach my $line (@input) {
    $line =~ /([\w\-]+)/;  # Get the names
    my $elem = $1;
    my $name = $elem;
    $name =~ s/\-/_/g;  # Convert dashes to underscores
    $name = uc($name); # Convert it to upper case
    print OUTPUT 'this.'.$name.' = createDOMFunc("'.$elem.'")'."\n";
}

close OUTPUT;
