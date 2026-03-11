OUTPUT_PATH = '/tmp/18b30779-acbf-4533-8459-f5df853a94fb.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Main Wall: 14'6" (Width) x 9' (Height)
    Opening (Door + AC): 7' (Width) x 8' (Height) located at the bottom-left.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor: 1 foot = 0.3048 meters
    ft_to_m = 0.3048

    # Dimensions from image analysis:
    # Total Width = 7' (left section) + 7'6" (right section) = 14.5 feet
    # Total Height = 9 feet
    # Opening Width = 7 feet
    # Opening Height = 8 feet (leaving 1 foot gap at the top)
    
    wall_width = 14.5 * ft_to_m
    wall_height = 9.0 * ft_to_m
    wall_thickness = 0.1  # Standard wall thickness (approx 4 inches)
    
    opening_width = 7.0 * ft_to_m
    opening_height = 8.0 * ft_to_m

    # 1. Create the Main Wall
    # We use size=1 and scale it to the exact dimensions for precision
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall_Skeleton"
    wall.scale = (wall_width, wall_height, wall_thickness)
    # Position so the bottom-left corner is at (0,0,0)
    wall.location = (wall_width / 2, wall_height / 2, 0)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)

    # 2. Create the Opening (Door + AC area)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Opening_Cutout"
    opening.scale = (opening_width, opening_height, wall_thickness * 2) # Thicker for clean boolean cut
    # Position at the bottom-left
    opening.location = (opening_width / 2, opening_height / 2, 0)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)

    # 3. Perform Boolean Subtraction
    bool_mod = wall.modifiers.new(name="Subtract_Opening", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Cleanup: Remove the helper opening object
    bpy.data.objects.remove(opening, do_unlink=True)

    # 5. Export to GLB
    # use_selection=False ensures the entire scene (the wall skeleton) is exported
    bpy.ops.export_scene.gltf(
        filepath='/tmp/18b30779-acbf-4533-8459-f5df853a94fb.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly as requested
create_wall_skeleton()